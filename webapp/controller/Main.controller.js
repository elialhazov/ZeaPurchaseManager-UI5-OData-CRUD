sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/MessageBox"
], function (Controller, MessageToast, Dialog, Button, Label, Input, VBox, MessageBox) {
    "use strict";

    return Controller.extend("zeaproject.controller.Main", {

        onInit() {},

        onRowPress(oEvent) {
            var oItem = oEvent.getSource();
            var sPoNumber = oItem.getBindingContext().getProperty("PoNumber");

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteDetail", { PoNumber: sPoNumber });
        },


        onCreatePress: function () {
            if (!this.oCreateDialog) {
                this.oCreateDialog = new Dialog({
                    title: "Create Purchase Order",
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

                            new Label({ text: "Document Type" }),
                            this._inDOCTYPE = new Input({ placeholder: "NB / EC / ..." }),

                            new Label({ text: "Purchase Org" }),
                            this._inORG = new Input({ placeholder: "3000" }),

                            new Label({ text: "Purchase Group" }),
                            this._inGRP = new Input({ placeholder: "013" }),

                            new Label({ text: "Created By" }),
                            this._inCREATED = new Input({ placeholder: "Enter Username" }),

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
                        press: function () { this.oCreateDialog.close(); }.bind(this)
                    })
                });
            }

            this.oCreateDialog.open();
        },

        _validateFields: function () {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            const onlyDigits = (v) => /^[0-9]+$/.test(v);

            if (this._inPO.getValue().length === 10 && onlyDigits(this._inPO.getValue())) {
                this._inPO.setValueState("None");
            } else {
                this._inPO.setValueState("Error");
                this._inPO.setValueStateText(oBundle.getText("error_po"));
            }

            if (this._inVENDOR.getValue().length === 4 && onlyDigits(this._inVENDOR.getValue())) {
                this._inVENDOR.setValueState("None");
            } else {
                this._inVENDOR.setValueState("Error");
                this._inVENDOR.setValueStateText(oBundle.getText("error_vendor"));
            }

            if (this._inZTERM.getValue().length === 4 && onlyDigits(this._inZTERM.getValue())) {
                this._inZTERM.setValueState("None");
            } else {
                this._inZTERM.setValueState("Error");
                this._inZTERM.setValueStateText(oBundle.getText("error_zterm"));
            }
        },

        _onSave: function () {
            var oModel = this.getView().getModel();

            this._validateFields();

            if (
                this._inPO.getValueState() === "Error" ||
                this._inVENDOR.getValueState() === "Error" ||
                this._inZTERM.getValueState() === "Error"
            ) {
                MessageToast.show("Please correct highlighted fields");
                return;
            }

            var oEntry = {
                PoNumber: this._inPO.getValue(),
                VendorNo: this._inVENDOR.getValue(),
                Zterm: this._inZTERM.getValue(),
                DocType: this._inDOCTYPE.getValue(),
                PurchaseOrg: this._inORG.getValue(),
                PurchaseGroup: this._inGRP.getValue(),
                CreatedBy: this._inCREATED.getValue()
            };

            oModel.create("/PurchaseOrderDetailSet", oEntry, {
                success: function () {
                    MessageToast.show("PO Created Successfully!");
                    oModel.refresh(true);
                    this.oCreateDialog.close();
                }.bind(this),

                error: function (err) {
                    MessageToast.show("Error creating PO");
                    console.error(err);
                }
            });
        },

        onDeletePress: function () {

            if (!this.oDeleteDialog) {

                this.oDeleteDialog = new Dialog({
                    title: "Delete Purchase Order",
                    type: "Message",
                    contentWidth: "400px",

                    content: new VBox({
                        items: [

                            new Label({ text: "Enter PO Number to delete:" }),
                            this._deletePO = new Input({
                                placeholder: "10-digit PO Number"
                            })

                        ],
                        width: "100%"
                    }),

                    beginButton: new Button({
                        text: "Delete",
                        type: "Reject",
                        press: this._confirmDelete.bind(this)
                    }),

                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oDeleteDialog.close();
                        }.bind(this)
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
                MessageToast.show("PO Number must be 10 digits");
                return;
            }

            var sPath = "/PurchaseOrderHeaderSet('" + sPo + "')";

            oModel.read(sPath, {
                success: function () {

                    oModel.remove(sPath, {
                        success: function () {
                            MessageToast.show("PO Deleted Successfully");
                            oModel.refresh(true);
                            this.oDeleteDialog.close();
                        }.bind(this),

                        error: function () {
                            MessageToast.show("Delete failed");
                        }
                    });

                }.bind(this),

                error: function () {
                    MessageToast.show("PO Number does not exist");
                }
            });
        }

    });
});
