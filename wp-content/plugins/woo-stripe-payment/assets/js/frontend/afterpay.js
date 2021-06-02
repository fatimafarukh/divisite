(function ($, wc_stripe) {

    function Utils() {
    }

    Utils.prototype.add_eligibility = function (selector) {
        if ($(selector).length) {
            if (this.needs_shipping()) {
                $(selector).removeClass('ineligible');
            } else {
                $(selector).addClass('ineligible');
            }
        }
    }

    Utils.prototype.get_element_options = function () {
        var locale = this.params.locale;
        if (this.get_currency() === 'GBP' && ['fr-FR', 'it-IT', 'es-ES'].indexOf(locale) < 0) {
            locale = 'en-GB';
        } else if (this.params.supported_locales.indexOf(this.params.locale) < 0) {
            locale = 'auto';
        }
        return {
            'locale': locale
        }
    }

    /**
     * Product page integration
     * @constructor
     */
    function AfterpayProduct(params) {
        wc_stripe.BaseGateway.call(this, params);
        wc_stripe.ProductGateway.call(this);
        $(document.body).on('change', '[name="quantity"]', this.mount_message.bind(this, true));
    }

    AfterpayProduct.prototype = $.extend({}, wc_stripe.BaseGateway.prototype, wc_stripe.ProductGateway.prototype, Utils.prototype);

    AfterpayProduct.prototype.initialize = function () {
        if (!this.msgElement) {
            this.create_element();
            this.mount_message();
            this.add_eligibility('#wc-stripe-afterpay-product-msg');
        }
    }

    AfterpayProduct.prototype.get_product_price = function () {
        var qty = $('[name="quantity"]').val();
        if (!qty) {
            qty = 0;
        }
        return (this.get_product_data().price * Math.pow(10, 2)) * parseInt(qty);
    }

    AfterpayProduct.prototype.create_element = function () {
        this.msgElement = this.elements.create('afterpayClearpayMessage', $.extend({}, this.params.msg_options, {
            amount: this.get_product_price(),
            currency: this.get_currency()
        }));
    }

    AfterpayProduct.prototype.mount_message = function (update) {
        if (update && this.msgElement) {
            this.msgElement.update({
                amount: this.get_product_price(),
                currency: this.get_currency(),
                isEligible: this.needs_shipping()
            })
        }
        var $el = $('#wc-stripe-afterpay-product-msg');
        if (!$el.length) {
            $('.summary .price').append('<div id="wc-stripe-afterpay-product-msg"></div>');
        }
        this.msgElement.mount('#wc-stripe-afterpay-product-msg');
    }

    /**
     * Cart page integration
     * @constructor
     */
    function AfterpayCart(params) {
        wc_stripe.BaseGateway.call(this, params);
        wc_stripe.CartGateway.call(this);
    }

    AfterpayCart.prototype = $.extend({}, wc_stripe.BaseGateway.prototype, wc_stripe.CartGateway.prototype, Utils.prototype);

    AfterpayCart.prototype.initialize = function () {
        if (!this.msgElement && $(this.container).length) {
            this.create_element();
            this.mount_message();
            this.add_eligibility('#wc-stripe-afterpay-cart-container');
        }
    }

    AfterpayCart.prototype.create_element = function () {
        this.msgElement = this.elements.create('afterpayClearpayMessage', $.extend({}, this.params.msg_options, {
            amount: this.get_total_price_cents(),
            currency: this.get_currency()
        }));
    }

    AfterpayCart.prototype.mount_message = function (update) {
        if (update && this.msgElement) {
            this.msgElement.update({
                amount: this.get_total_price_cents(),
                currency: this.get_currency(),
                isEligible: this.needs_shipping()
            })
        }
        var $el = $('#wc-stripe-afterpay-cart-container');
        if (!$el.length) {
            $('.cart_totals table.shop_table tbody').append('<tr id="wc-stripe-afterpay-cart-container"><td colspan="2"><div id="wc-stripe-afterpay-cart-msg"></div></td></tr>');
        }
        this.msgElement.mount('#wc-stripe-afterpay-cart-msg');
    }

    AfterpayCart.prototype.updated_html = function () {
        if (!$(this.container).length) {
            return;
        }
        this.mount_message(true);
        this.add_eligibility('#wc-stripe-afterpay-cart-container');
    }

    if (typeof wc_stripe_afterpay_product_params !== 'undefined') {
        new AfterpayProduct(wc_stripe_afterpay_product_params);
    } else if (typeof wc_stripe_afterpay_cart_params !== 'undefined') {
        new AfterpayCart(wc_stripe_afterpay_cart_params);
    }

})(jQuery, window.wc_stripe);