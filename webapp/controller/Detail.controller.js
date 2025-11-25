sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/MessageToast",
    "sap/m/VBox"
], function (Controller, Dialog, Button, Label, Input, MessageToast, VBox) {
    "use strict";

    return Controller.extend("zeaproject.controller.Detail", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail")
                .attachPatternMatched(this._onObjectMatched, this);

            this._selectedItem = null;
        },

        // =========================================================
        // LOAD HEADER + ITEMS (VIA $expand)
        // =========================================================
        _onObjectMatched: function (oEvent) {

            let sPoNumber = oEvent.getParameter("arguments").PoNumber;
            this._poNumber = sPoNumber;

            // --- 1) Bind HEADER with EXPAND ---
            let sHeaderPath = "/PurchaseOrderHeaderSet('" + sPoNumber + "')";

            this.getView().bindElement({
                path: sHeaderPath,
                parameters: {
                    expand: "NP_PODetails"
                },
                events: {
                    dataReceived: () => {
                        console.log("Header + NP_PODetails loaded successfully");
                    }
                }
            });

            // --- 2) Bind ITEMS TABLE (navigation property) ---
            let oTable = this.byId("itemTable");

            oTable.bindItems({
                path: sHeaderPath + "/NP_PODetails",
                template: new sap.m.ColumnListItem({
                    type: "Active",
                    press: this.onSelectItem.bind(this),
                    cells: [
                        new sap.m.Text({ text: "{ItemNo}" }),
                        new sap.m.Text({ text: "{Material}" }),
                        new sap.m.Text({ text: "{CreatedBy}" })
                    ]
                })
            });
        },

        // =========================================================
        // NAV BACK
        // =========================================================
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },

        // =========================================================
        // SELECT ITEM
        // =========================================================
        onSelectItem: function (oEvent) {
            this._selectedItem = oEvent.getSource().getBindingContext().getObject();
        },

        // =========================================================
        // CREATE ITEM
        // =========================================================
        onCreatePress: function () {
            this._openPopup({
                PoNumber: this._poNumber,
                ItemNo: "",
                Material: "",
                CreatedBy: ""
            }, true);
        },

        // =========================================================
        // EDIT ITEM
        // =========================================================
        onEditPress: function () {
            if (!this._selectedItem) {
                MessageToast.show("Please select an item first");
                return;
            }

            this._openPopup(this._selectedItem, false);
        },

        // =========================================================
        // POPUP (CREATE / EDIT)
        // =========================================================
        _openPopup: function (oData, isCreate) {

            if (this.oDialog) this.oDialog.destroy();

            this.oDialog = new Dialog({
                title: isCreate ? "Create Item" : "Edit Item",
                type: "Message",
                contentWidth: "500px",

                content: new VBox({
                    items: [

                        new Label({ text: "PO Number" }),
                        this._inPO = new Input({ value: oData.PoNumber, editable: false }),

                        new Label({ text: "Item Number" }),
                        this._inItem = new Input({
                            value: oData.ItemNo,
                            editable: isCreate
                        }),

                        new Label({ text: "Material" }),
                        this._inMaterial = new Input({ value: oData.Material }),

                        new Label({ text: "Created By" }),
                        this._inCreated = new Input({ value: oData.CreatedBy })
                    ]
                }),

                beginButton: new Button({
                    text: "Save",
                    type: "Emphasized",
                    press: () => this._onSave(isCreate)
                }),

                endButton: new Button({
                    text: "Cancel",
                    press: () => this.oDialog.close()
                })
            });

            this.oDialog.open();
        },

        // =========================================================
        // SAVE (CREATE / UPDATE)
        // =========================================================
        _onSave: function (isCreate) {
            let oModel = this.getView().getModel();

            let oEntry = {
                PoNumber: this._inPO.getValue(),
                ItemNo: this._inItem.getValue(),
                Material: this._inMaterial.getValue(),
                CreatedBy: this._inCreated.getValue()
            };

            let sPath =
                "/PurchaseOrderDetailSet(PoNumber='" +
                oEntry.PoNumber + "',ItemNo='" + oEntry.ItemNo + "')";

            if (isCreate) {

                oModel.create("/PurchaseOrderDetailSet", oEntry, {
                    success: () => {
                        MessageToast.show("Item created!");
                        this._refreshItems();
                        this.oDialog.close();
                    },
                    error: console.error
                });

            } else {

                oModel.update(sPath, oEntry, {
                    success: () => {
                        MessageToast.show("Item updated!");
                        this._refreshItems();
                        this.oDialog.close();
                    },
                    error: console.error
                });
            }
        },

        // =========================================================
        // REFRESH ITEMS (refresh NP_PODetails navigation)
        // =========================================================
        _refreshItems: function () {
            let oBind = this.getView().getElementBinding();
            if (oBind) oBind.refresh(true);
        }

    });
});
