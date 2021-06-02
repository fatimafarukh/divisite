<?php

namespace PaymentPlugins\Blocks\Stripe\Payments;

class CreditCardPayment extends AbstractStripePayment {

	protected $name = 'stripe_cc';

	public function get_payment_method_script_handles() {
		$this->assets_api->register_script( 'wc-stripe-block-credit-card', 'build/wc-stripe-credit-card.js' );

		return array( 'wc-stripe-block-credit-card' );
	}

	public function get_payment_method_data() {
		return wp_parse_args( array(
			'cardOptions'            => $this->payment_method->get_card_form_options(),
			'customFieldOptions'     => $this->payment_method->get_card_custom_field_options(),
			'customFormActive'       => $this->payment_method->is_custom_form_active(),
			'elementOptions'         => $this->payment_method->get_element_options(),
			'customForm'             => $this->payment_method->get_option( 'custom_form' ),
			'customFormLabels'       => wp_list_pluck( wc_stripe_get_custom_forms(), 'label' ),
			'postalCodeEnabled'      => $this->payment_method->postal_enabled(),
			'saveCardEnabled'        => $this->payment_method->is_active( 'save_card_enabled' ),
			'savePaymentMethodLabel' => __( 'Save Card', 'woo-stripe-payment' ),
			'cards'                  => array(
				'visa'       => stripe_wc()->assets_url( 'img/cards/visa.svg' ),
				'amex'       => stripe_wc()->assets_url( 'img/cards/amex.svg' ),
				'mastercard' => stripe_wc()->assets_url( 'img/cards/mastercard.svg' ),
				'discover'   => stripe_wc()->assets_url( 'img/cards/discover.svg' ),
				'diners'     => stripe_wc()->assets_url( 'img/cards/diners.svg' ),
				'jcb'        => stripe_wc()->assets_url( 'img/cards/jcb.svg' ),
				'unionpay'   => stripe_wc()->assets_url( 'img/cards/china_union_pay.svg' ),
				'unknown'    => $this->payment_method->get_custom_form()['cardBrand'],
			)
		), parent::get_payment_method_data() );
	}

	protected function get_payment_method_icon() {
		$icons = array();
		foreach ( $this->payment_method->get_option( 'cards' ) as $id ) {
			$icons[] = array(
				'id'  => $id,
				'alt' => '',
				'src' => stripe_wc()->assets_url( "img/cards/{$id}.svg" )
			);
		}

		return $icons;
	}

	/**
	 * @param \PaymentPlugins\Blocks\Stripe\Assets\Api $style_api
	 */
	public function enqueue_payment_method_styles( $style_api ) {
		if ( $this->payment_method->is_custom_form_active() ) {
			$form = $this->payment_method->get_option( 'custom_form' );
			wp_enqueue_style( 'wc-stripe-credit-card-style', $style_api->get_asset_url( "build/credit-card/{$form}.css" ) );
			wp_style_add_data( 'wc-stripe-credit-card-style', 'rtl', 'replace' );
		}
	}
}