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
            let sPoNumber = oEvent.getParameter("arguments").PoNumber;
            let oModel = this.getView().getModel();

            this._sPath = "/PurchaseOrderDetailSet(PoNumber='" + sPoNumber + "',ItemNo='')";

            oModel.read(this._sPath, {
                success: () => {
                    this.getView().bindElement(this._sPath);
                },
                error: () => console.error("Path not found:", this._sPath)
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },


        // EDIT POPUP
        onEditPress: function () {

            let oData = this.getView().getBindingContext().getObject();

            if (!this.oEditDialog) {

                this.oEditDialog = new Dialog({
                    title: "Edit Item",
                    type: "Message",
                    contentWidth: "500px",

                    content: new VBox({
                        items: [

                            new Label({ text: "PO Number" }),
                            this._editPO = new Input({ editable: false }),

                            new Label({ text: "Item Number" }),
                            this._editItem = new Input(),  

                            new Label({ text: "Material" }),
                            this._editMaterial = new Input(),

                            new Label({ text: "Created By" }),
                            this._editCreated = new Input()

                        ],
                        width: "100%"
                    }),

                    beginButton: new Button({
                        text: "Save",
                        type: "Emphasized",
                        press: this._onSaveEdit.bind(this)
                    }),

                    endButton: new Button({
                        text: "Cancel",
                        press: () => this.oEditDialog.close()
                    })
                });
            }

            this._editPO.setValue(oData.PoNumber);
            this._editItem.setValue(oData.ItemNo);
            this._editMaterial.setValue(oData.Material);
            this._editCreated.setValue(oData.CreatedBy);

            if (!oData.ItemNo) {
                this._editItem.setEditable(true);
            } else {
                this._editItem.setEditable(false);
            }

            this.oEditDialog.open();
        },

        //SAVE UPDATE
        _onSaveEdit: function () {

            let oModel = this.getView().getModel();

            let oEntry = {
                PoNumber: this._editPO.getValue(),
                ItemNo: this._editItem.getValue(),         
                Material: this._editMaterial.getValue(),
                CreatedBy: this._editCreated.getValue()
            };

            oModel.update(this._sPath, oEntry, {
                success: () => {
                    MessageToast.show("Item updated successfully!");
                    oModel.refresh(true);
                    this.oEditDialog.close();
                },

                error: (err) => {
                    MessageToast.show("Update failed");
                    console.error(err);
                }
            });

        }

    });
});
