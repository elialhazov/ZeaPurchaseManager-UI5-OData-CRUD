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
        },

        _onObjectMatched: function (oEvent) {
            var sPoNumber = oEvent.getParameter("arguments").PoNumber;
            var oModel = this.getView().getModel();

            this._sPath = "/PurchaseOrderDetailSet('" + sPoNumber + "')";

            oModel.read(this._sPath, {
                success: function () {
                    this.getView().bindElement(this._sPath);
                }.bind(this),
                error: function () {
                    console.error("Path not found:", this._sPath);
                }.bind(this)
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
        },

        onEditPress: function () {

            var oData = this.getView().getBindingContext().getObject();

            if (!this.oEditDialog) {

                this.oEditDialog = new Dialog({
                    title: "Edit Purchase Order",
                    type: "Message",
                    contentWidth: "500px",

                    content: new VBox({
                        items: [

                            new Label({ text: "PO Number" }),
                            this._editPO = new Input({
                                editable: false,    
                                enabled: false     
                            }),

                            new Label({ text: "Vendor Number" }),
                            this._editVendor = new Input({
                                liveChange: this._validateFields.bind(this)
                            }),

                            new Label({ text: "Payment Terms (ZTERM)" }),
                            this._editZterm = new Input({
                                liveChange: this._validateFields.bind(this)
                            }),

                            new Label({ text: "Document Type" }),
                            this._editDoc = new Input(),

                            new Label({ text: "Purchase Org" }),
                            this._editOrg = new Input(),

                            new Label({ text: "Purchase Group" }),
                            this._editGroup = new Input()
                        ],
                        width: "100%"
                    }),

                    beginButton: new Button({
                        text: "Save",
                        type: "Emphasized",
                        press: this._onUpdatePress.bind(this)
                    }),

                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oEditDialog.close();
                        }.bind(this)
                    })
                });
            }

            // Prefill all fields
            this._editPO.setValue(oData.PoNumber);
            this._editVendor.setValue(oData.VendorNo);
            this._editZterm.setValue(oData.Zterm);
            this._editDoc.setValue(oData.DocType);
            this._editOrg.setValue(oData.PurchaseOrg);
            this._editGroup.setValue(oData.PurchaseGroup);

            this.oEditDialog.open();
        },

        _validateFields: function () {

            const onlyDigits = (v) => /^[0-9]+$/.test(v);

            // Vendor
            if (this._editVendor.getValue().length === 4 && onlyDigits(this._editVendor.getValue())) {
                this._editVendor.setValueState("None");
            } else {
                this._editVendor.setValueState("Error");
                this._editVendor.setValueStateText("Vendor must be 4 digits");
            }

            // ZTERM
            if (this._editZterm.getValue().length === 4 && onlyDigits(this._editZterm.getValue())) {
                this._editZterm.setValueState("None");
            } else {
                this._editZterm.setValueState("Error");
                this._editZterm.setValueStateText("ZTERM must be 4 digits");
            }
        },

        _onUpdatePress: function () {

            var oModel = this.getView().getModel();

            // validate again before saving
            this._validateFields();

            if (
                this._editVendor.getValueState() === "Error" ||
                this._editZterm.getValueState() === "Error"
            ) {
                MessageToast.show("Please correct highlighted fields");
                return;
            }

            var oEntry = {
                VendorNo: this._editVendor.getValue(),
                Zterm: this._editZterm.getValue(),
                DocType: this._editDoc.getValue(),
                PurchaseOrg: this._editOrg.getValue(),
                PurchaseGroup: this._editGroup.getValue()
            };

            oModel.update(this._sPath, oEntry, {
                success: function () {
                    MessageToast.show("Updated Successfully!");
                    oModel.refresh(true);
                    this.oEditDialog.close();
                }.bind(this),

                error: function (err) {
                    MessageToast.show("Update Failed");
                    console.error(err);
                }
            });
        }
    });
});
