sap.ui.define([
    "sap/ui/core/UIComponent",
    "zeaproject/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("zeaproject.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

                var oModel = new sap.ui.model.odata.v2.ODataModel(
        "/sap/opu/odata/sap/ZEA_PROJECT_SRV/",
        {
            useBatch: false
        }
    );

    this.setModel(oModel);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }


    });
});