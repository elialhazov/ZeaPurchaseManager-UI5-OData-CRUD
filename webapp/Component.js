sap.ui.define([
    "sap/ui/core/UIComponent",
    "zeaproject/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("zeaproject.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            // Set device model only
            this.setModel(models.createDeviceModel(), "device");

            // init routing
            this.getRouter().initialize();
        }
    });
});
