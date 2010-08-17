/*!
 * CloudFlare UI DataRenderer
 *
 * Copyright 2010, AUTHORS.txt
 * Dual licensed under the MIT & GPLv2 licenses.
 * See MIT-LICENSE.txt & GPL-LICENSE.txt
 * 
 * CloudFlare UI Documentation:
 * 
 * http://wiki.github.com/cloudflare/CloudFlare-UI/
 * 
 * 
 * CloudFlare UI incorporates the following independent projects:
 * 
 * jQuery (Dual licensed under MIT & GPLv2 licenses)
 * http://jquery.com/
 * Copyright 2010, John Resig
 *
 * QUnit (Dual licensed under MIT & GPLv2 licenses)
 * http://docs.jquery.com/QUnit
 * Copyright 2009, John Resig, J�rn Zaefferer
 */
(function($) {
    
    $.cf.component(
        'cf.dataRenderer',
        {
            _settings: {
                dataProvider: new $.cf.Collection(),
                itemRenderer: null
            },
            _initialize: function() {
                
                var self = this;
                
                self.superMethod();
                
                self._invalidateDataProvider();
                self._invalidateItemRenderer();
            },
            _invalidateDataProvider: function() {
                
                // Redraw display based on current data provider..
            },
            _invalidateItemRenderer: function() {
                
                // Redraw display based on current item renderer..
            },
            dataProvider: function(dataProvider) {
                
                var self = this;
                
                if(dataProvider && dataProvider instanceof $.cf.Collection) {
                    
                    // Set..
                    self._settings.dataProvider = dataProvider;
                    self._invalidateDataProvider();
                } else {
                    
                    // Get..
                    return self._settings.dataProvider;
                }
            },
            itemRenderer: function(itemRenderer) {
                
                if(itemRenderer && typeof itemRenderer == 'string') {
                    
                    // Set..
                    self._settings.itemRenderer = itemRenderer;
                    self._invalidateItemRenderer();
                } else {
                    
                    // Get..
                    return self._settings.itemRenderer;
                }
            }
        }
    );
})(jQuery);