/*!
 * CloudFlare UI Component Factory
 *
 * Copyright 2010, AUTHORS.txt
 * Licensed under the MIT license, see MIT-LICENSE.txt
 *
 * TODO: Documentation URL
 */
(function($) {
    
    // Inheritance pattern inspired by John Resig's article at
    // http://ejohn.org/blog/simple-javascript-inheritance/
    $.extend(
        $.cf,
        {
            // The base subclassable object for the CloudFlare chain
            CloudFlareObject: function() {},
        }
    );
    
    $.extend(
        $.cf.CloudFlareObject,
        {
            subclass: function(properties) {
                
                var self = this,
                    parentClass = self.prototype,
                    nextPrototype = new self(null, true),
                    NextClass;
                
                // We need to sequentially copy properties into the new prototype
                for(var property in properties) {
                    
                    // Handle class methods
                    if( typeof properties[property] == 'function' &&
                        $.isFunction(properties[property])) {
                        
                        nextPrototype[property] = (function(property, implementation) {
                            
                            // We return a proxy function that sets class-level properties
                            // referencing the inherited prototype (superClass) and the
                            // overridden method (superMethod) if one exists.
                            return function() {
                                var placeholder = this.superMethod,
                                    returnValue;
                                
                                this.superClass = parentClass;
                                this.superMethod = this.superClass[property] || function() {};
                                
                                // Now that superClass and superMethod are set, we can call the 
                                // actual class method.
                                returnValue = implementation.apply(this, arguments);
                                this.superMethod = placeholder;
                                
                                return returnValue;
                            }
                        })(property, properties[property]);
                    // Handle properties that are value objects by extending and overriding 
                    // values with those from the same property in the subclass.
                    } else if(  typeof properties[property] == 'object' && 
                                typeof parentClass[property] == 'object' &&
                                $.isPlainObject(properties[property])) {
                        
                        nextPrototype[property] = $.extend(
                            {},
                            parentClass[property],
                            properties[property]
                        );
                    // Default to blindly copying over the new property for all other types.
                    } else {
                        
                        nextPrototype[property] = properties[property];
                    }
                }
                
                // We will wrap construction in a function that checks to make sure that we are 
                // not instantiating the class for the purposes of deriving another class.
                NextClass = function(parameters, subclassing) {
                    if(!subclassing && this._construct) {
                        
                        this._construct.apply(this, parameters);
                    }
                };
                
                NextClass.prototype = nextPrototype;
                NextClass.constructor = NextClass;
                
                // Pass 'subclass' along to the new class, as it is not part of the prototype
                NextClass.subclass = arguments.callee;
                
                return NextClass;
            }
        }
    );
    
    // Base class for all CloudFlare UI components. The Component is an abstract
    // class, and cannot be instantiated through the component factory.
    // TODO: Component event dispatching..
    $.extend(
        $.cf,
        {
            CloudFlareComponent: $.cf.CloudFlareObject.subclass(
                {
                    _construct: function(element, componentName) {
                        
                        // Construct! Sub-components should not override the constructor..
                        var self = this;
                        
                        self._componentName = componentName;
                        self._element = $(element);
                        self._element.bind(
                            'remove',
                            function(event) {
                                
                                self.destroy();
                            }
                        );
                        
                        $.data(self._element, self._componentName, self);
                        self.initialize.apply(self, $.map(arguments, function(a, i) { return i == 0 ? null : a; }));
                    },
                    destruct: function() {
                        
                        // Remove bound events and data..
                        var self = this;
                        
                        self._element.removeData(self.componentName);
                        // TODO: Detach events..
                    },
                    initialize: function() {
                        
                        // Initialize! This method is safe to override..
                    }
                }
            )
        }
    );
    
    // UI component factory inspired by jQuery UI's widget pattern.
    // Expands upon it by incorporating super-class awareness.
    $.extend(
        $.cf,
        {
            // Registers the component, derives the class and 'bridges' it
            component: function(path, base, subclass) {
                
                var namespace = path.split('.')[0],
                    name = path.split('.')[1];
                
                if(!subclass) {
                    // Subclass isn't defined, so default to CloudFlareComponent
                    subclass = base;
                    base = $.cf.CloudFlareComponent;
                }
                
                // Create the namespace if it isn't there, and assign the subclass
                $[namespace] = $[namespace] || {};
                $[namespace][name] = base.subclass(subclass);
                
                // Build the method to instantiate the component on DOM elements
                $.cf.bridge(name, $[namespace][name]);
            },
            // Patches the component into jQuery.fn, and controls component method access
            bridge: function(className, Component) {
                
                $.fn[className] = function(method) {
                    
                    var targets = this,
                        options = arguments.length ? $.map(arguments, function(a, i) { return i == 0 ? null : a; }) : [];
                    
                    // If no method is specified, we will attempt to construct
                    method = method || '_construct';
                    
                    // If we're constructing, we should make space for the 'element' argument
                    if(method == '_construct') {
                        
                        options.unshift(null, null);
                    }
                    
                    targets.each(
                        function(i, e) {
                            var target = this;
                            var component = $.data(target, className);
                            
                            // We're constructing only if the component doesn't exist
                            if(method == '_construct' && !component) {
                                
                                // For construction, we replace the first two argument with the 
                                // element target and the class name.
                                options.splice(0, 1, target, className);
                                $.data(target, className, new Component(options));
                            } else if(component && method.substr(0, 1) != '_' && $.isFunction(component[method])) {
                                
                                // Everything checks out, so call the method and pass the arguments
                                result = component[method].apply(component, options);
                            } else {
                                
                                // The user called a private method that isn't the constructor, 
                                // or they called the constructor after construction is complete
                                return false;
                            }
                        }
                    );
                    
                    return targets;
                }
            }
        }
    );
})(jQuery);