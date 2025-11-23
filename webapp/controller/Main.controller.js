sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/VBox"
], function (Controller, MessageToast, Dialog, Button, Label, Input, VBox) {
    "use strict";

    return Controller.extend("zeaproject.controller.Main", {

        onInit() {},

        // NAV TO DETAIL
        onRowPress(oEvent) {
            var sPoNumber = oEvent.getSource().getBindingContext().getProperty("PoNumber");
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                PoNumber: sPoNumber
            });
        },

        //CREATE HEADER

        onCreatePress: function () {
            if (!this.oCreateDialog) {

                this.oCreateDialog = new Dialog({
                    title: "Create Purchase Order Header",
                    type: "Message",
                    contentWidth: "500px",

                    content: new VBox({
                        items: [

                            new Label({ text: "PO Number" }),
                            this._inPO = new Input({
                                placeholder: "Enter PO Number",
                                liveChange: this._validateFields.bind(this)
                            }),

                            new Label({ text: "Vendor Number" }),
                            this._inVENDOR = new Input({
                                placeholder: "Enter Vendor Number",
                                liveChange: this._validateFields.bind(this)
                            }),

                            new Label({ text: "Payment Terms (ZTERM)" }),
                            this._inZTERM = new Input({
                                placeholder: "Enter Payment Terms",
                                liveChange: this._validateFields.bind(this)
                            }),

                        ],
                        width: "100%"
                    }),

                    beginButton: new Button({
                        text: "Save",
                        type: "Emphasized",
                        press: this._onSave.bind(this)
                    }),

                    endButton: new Button({
                        text: "Cancel",
                        press: () => this.oCreateDialog.close()
                    })
                });
            }

            this.oCreateDialog.open();
        },

        //VALIDATIONS
        _validateFields: function () {
            const onlyDigits = (v) => /^[0-9]+$/.test(v);

            // PO Number
            if (this._inPO.getValue().length === 10 && onlyDigits(this._inPO.getValue())) {
                this._inPO.setValueState("None");
            } else {
                this._inPO.setValueState("Error");
                this._inPO.setValueStateText("PO must be 10 digits");
            }

            // Vendor
            if (this._inVENDOR.getValue().length === 4 && onlyDigits(this._inVENDOR.getValue())) {
                this._inVENDOR.setValueState("None");
            } else {
                this._inVENDOR.setValueState("Error");
                this._inVENDOR.setValueStateText("Vendor must be 4 digits");
            }

            // ZTERM
            if (this._inZTERM.getValue().length === 4 && onlyDigits(this._inZTERM.getValue())) {
                this._inZTERM.setValueState("None");
            } else {
                this._inZTERM.setValueState("Error");
                this._inZTERM.setValueStateText("ZTERM must be 4 digits");
            }
        },

        //SAVE HEADER
        _onSave: function () {

            this._validateFields();
            var oModel = this.getView().getModel();

            if (
                this._inPO.getValueState() === "Error" ||
                this._inVENDOR.getValueState() === "Error" ||
                this._inZTERM.getValueState() === "Error"
            ) {
                MessageToast.show("Please fix the errors");
                return;
            }

            var oEntry = {
                PoNumber: this._inPO.getValue(),
                VendorNo: this._inVENDOR.getValue(),
                Zterm: this._inZTERM.getValue()
            };

            oModel.create("/PurchaseOrderHeaderSet", oEntry, {
                success: () => {
                    MessageToast.show("PO Header Created Successfully!");
                    oModel.refresh(true);
                    this.oCreateDialog.close();
                },
                error: (err) => {
                    MessageToast.show("Error creating PO Header");
                    console.error(err);
                }
            });
        },

        // DELETE HEADER
        onDeletePress: function () {

            if (!this.oDeleteDialog) {

                this.oDeleteDialog = new Dialog({
                    title: "Delete Purchase Order Header",
                    type: "Message",
                    contentWidth: "400px",

                    content: new VBox({
                        items: [
                            new Label({ text: "Enter PO Number to delete:" }),
                            this._deletePO = new Input({
                                placeholder: "10-digit PO Number"
                            })
                        ]
                    }),

                    beginButton: new Button({
                        text: "Delete",
                        type: "Reject",
                        press: this._confirmDelete.bind(this)
                    }),

                    endButton: new Button({
                        text: "Cancel",
                        press: () => this.oDeleteDialog.close()
                    })
                });
            }

            this._deletePO.setValue("");
            this.oDeleteDialog.open();
        },

        _confirmDelete: function () {
            var oModel = this.getView().getModel();
            var sPo = this._deletePO.getValue();

            if (sPo.length !== 10 || !/^[0-9]+$/.test(sPo)) {
                MessageToast.show("PO must be 10 digits");
                return;
            }

            var sPath = "/PurchaseOrderHeaderSet('" + sPo + "')";

            oModel.remove(sPath, {
                success: () => {
                    MessageToast.show("PO Deleted Successfully");
                    oModel.refresh(true);
                    this.oDeleteDialog.close();
                },

                error: () => {
                    MessageToast.show("PO does not exist");
                }
            });
        }

    });
});
