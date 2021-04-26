let Payment = {
	switchMethod: function(e){

		document.getElementById("flick-loader").style.display = "block";

		let paymentMethod = document.getElementsByClassName("payment-method");
		let paymentField = document.getElementsByClassName("flick-checkout-container-option-body-paymentfield");
		let paymentOption = e.getAttribute("data-payment-option");
		let paymentOptionView = document.getElementById(paymentOption+"-view");

		let paymentComplete = document.getElementById("payment-complete");
		paymentComplete.classList.add("hide");

		let checkoutBody = document.getElementById("checkout-body");
		checkoutBody.style.backgroundColor = "#eeeeee";

		[].forEach.call(paymentMethod, function(el) {
		    el.classList.remove("hide");
		});

		e.classList.add("hide");

		[].forEach.call(paymentField, function(el) {
		    el.classList.add("hide");
		});		

		paymentOptionView.classList.remove("hide");

		setTimeout(function(){
			document.getElementById("flick-loader").style.display = "none";
		},2000);

		if(paymentOption == "qr"){
			setTimeout(function(){
				document.getElementById("qr-view").classList.add("hide");
				document.getElementById("qr-scan-code-view").classList.remove("hide");
			},3000);
		}
	},

	selectBank: function(e){

		let bankBgColor = e.options[e.selectedIndex].getAttribute("data-bg-color");
		let bankButtonColor = e.options[e.selectedIndex].getAttribute("data-btn-color");
		let bankTextColor = e.options[e.selectedIndex].getAttribute("data-text-color");
		let bankBtnTextColor = e.options[e.selectedIndex].getAttribute("data-btn-text-color");
		let bankLogo = e.options[e.selectedIndex].getAttribute("data-logo");
		let fieldsToShow = e.options[e.selectedIndex].getAttribute("data-charge");

		if(fieldsToShow == "account_phone"){
			document.getElementById("account-field").classList.remove("hide");
			document.getElementById("phone-field").classList.remove("hide");
		}
		else if(fieldsToShow == "account"){
			document.getElementById("account-field").classList.remove("hide");
			document.getElementById("phone-field").classList.add("hide");
		}
		else{
			return;
		}

		let checkoutBody = document.getElementById("checkout-body");
		let checkoutBtn = document.getElementById("account-pay-btn");
		let goBackLink = document.getElementById("go-back-banks");

		document.getElementById("bank-view").classList.add("hide");
		document.getElementById("select-bank-view").classList.remove("hide");
		document.getElementById("selected-bank-img").src = bankLogo;

		document.getElementById("bank-customer-account").style.color = bankTextColor;		
		document.getElementById("bank-customer-phone").style.color = bankTextColor;		
		document.getElementById("bank-customer-bvn").style.color = bankTextColor;		
		document.getElementById("bank-customer-dob").style.color = bankTextColor;			

		checkoutBody.style.backgroundColor = bankBgColor;
		checkoutBtn.style.backgroundColor = bankButtonColor;
		checkoutBtn.style.color = bankBtnTextColor;
		goBackLink.style.color = bankTextColor;
		
	},

	banksGoBack: function(){
		document.getElementById("bank-view").classList.remove("hide");
		document.getElementById("select-bank-view").classList.add("hide");

		let checkoutBody = document.getElementById("checkout-body");
		checkoutBody.style.backgroundColor = "#eee";
	},

	getBankUSSDCode: function(e){
		let bankCode =  e.options[e.selectedIndex].getAttribute("data-bank-ussd-code");

		document.getElementById("ussd-code-text").innerHTML = "*"+bankCode+"#";
		document.getElementById("ussd-text-code-view").classList.remove("hide");
		document.getElementById("ussd-view").classList.add("hide");

		setTimeout(function(){
			document.getElementById("payment-complete").classList.remove("hide");
			document.getElementById("ussd-text-code-view").classList.add("hide");
			document.getElementById("payment-method-container").classList.add("hide");
		},5000)
	},

	goBackSelectUSSDBanks: function(){
		document.getElementById("ussd-text-code-view").classList.add("hide");
		document.getElementById("ussd-view").classList.remove("hide");

		let paymentField = document.getElementsByClassName("flick-checkout-container-option-body-paymentfield");

		[].forEach.call(paymentField, function(el) {
		    el.classList.add("hide");
		});
	},

	closePaymentSuccessMessage: function(){
		const urlParams = new URLSearchParams(window.location.search);
		const iframeParentUrl = urlParams.get('iframe_parent_url');

		location.href = iframeParentUrl;
	},

	processPayment: function(){
		let paymentField = document.getElementsByClassName("flick-checkout-container-option-body-paymentfield");

		document.getElementById("payment-complete").classList.remove("hide");
		document.getElementById("payment-method-container").classList.add("hide");

		[].forEach.call(paymentField, function(el) {
		    el.classList.add("hide");
		});

		let checkoutBody = document.getElementById("checkout-body");
		checkoutBody.style.backgroundColor = "#eee";
	},

	attachPaymentData: function(){
		const urlParams = new URLSearchParams(window.location.search);
		const iframeParentUrl = urlParams.get('iframe_parent_url');
		const paymentAmount = urlParams.get('amount');
		const customerFirstname = urlParams.get('customer_firstname');
		const customerEmail = urlParams.get('customer_email');
		const customerLogo = urlParams.get('custom_logo');

		document.getElementById("payment-amount").innerHTML = paymentAmount;
		document.getElementById("payment-currency-code").innerHTML = "NGN";
		document.getElementById("company-logo").src = customerLogo;
		document.getElementById("payment-name").innerHTML = customerFirstname;
		document.getElementById("payment-email").innerHTML = customerEmail;

		document.getElementById("customer-account-pay-btn").innerHTML = "NGN"+paymentAmount;
		document.getElementById("customer-paycard-btn").innerHTML = "NGN"+paymentAmount;

		document.getElementById("paid-customer-email").innerHTML = customerEmail;
	}
}

let ccNumberInput = document.querySelector('#cc-number-input'),
		ccNumberPattern = /^\d{0,16}$/g,
		ccNumberSeparator = " ",
		ccNumberInputOldValue,
		ccNumberInputOldCursor,
		
		ccExpiryInput = document.querySelector('#cc-expiry-input'),
		ccExpiryPattern = /^\d{0,4}$/g,
		ccExpirySeparator = "/",
		ccExpiryInputOldValue,
		ccExpiryInputOldCursor,
		
		ccCVCInput = document.querySelector('#cc-cvc-input'),
		ccCVCPattern = /^\d{0,3}$/g,
		
		mask = (value, limit, separator) => {
			var output = [];
			for (let i = 0; i < value.length; i++) {
				if ( i !== 0 && i % limit === 0) {
					output.push(separator);
				}
				
				output.push(value[i]);
			}
			
			return output.join("");
		},
		unmask = (value) => value.replace(/[^\d]/g, ''),
		checkSeparator = (position, interval) => Math.floor(position / (interval + 1)),
		ccNumberInputKeyDownHandler = (e) => {
			let el = e.target;
			ccNumberInputOldValue = el.value;
			ccNumberInputOldCursor = el.selectionEnd;
		},
		ccNumberInputInputHandler = (e) => {
			let el = e.target,
					newValue = unmask(el.value),
					newCursorPosition;
			
			if ( newValue.match(ccNumberPattern) ) {
				newValue = mask(newValue, 4, ccNumberSeparator);
				
				newCursorPosition = 
					ccNumberInputOldCursor - checkSeparator(ccNumberInputOldCursor, 4) + 
					checkSeparator(ccNumberInputOldCursor + (newValue.length - ccNumberInputOldValue.length), 4) + 
					(unmask(newValue).length - unmask(ccNumberInputOldValue).length);
				
				el.value = (newValue !== "") ? newValue : "";
			} else {
				el.value = ccNumberInputOldValue;
				newCursorPosition = ccNumberInputOldCursor;
			}
			
			el.setSelectionRange(newCursorPosition, newCursorPosition);
			
			highlightCC(el.value);
		},
		highlightCC = (ccValue) => {
			let ccCardType = '',
					ccCardTypePatterns = {
						amex: /^3/,
						visa: /^4/,
						mastercard: /^5/,
						disc: /^6/,
						
						genric: /(^1|^2|^7|^8|^9|^0)/,
					};
			
			for (const cardType in ccCardTypePatterns) {
				if ( ccCardTypePatterns[cardType].test(ccValue) ) {
					ccCardType = cardType;
					break;
				}
			}
			
			let activeCC = document.querySelector('.cc-types__img--active'),
					newActiveCC = document.querySelector(`.cc-types__img--${ccCardType}`);
			
			if (activeCC) activeCC.classList.remove('cc-types__img--active');
			if (newActiveCC) newActiveCC.classList.add('cc-types__img--active');
		},
		ccExpiryInputKeyDownHandler = (e) => {
			let el = e.target;
			ccExpiryInputOldValue = el.value;
			ccExpiryInputOldCursor = el.selectionEnd;
		},
		ccExpiryInputInputHandler = (e) => {
			let el = e.target,
					newValue = el.value;
			
			newValue = unmask(newValue);
			if ( newValue.match(ccExpiryPattern) ) {
				newValue = mask(newValue, 2, ccExpirySeparator);
				el.value = newValue;
			} else {
				el.value = ccExpiryInputOldValue;
			}
		};

ccNumberInput.addEventListener('keydown', ccNumberInputKeyDownHandler);
ccNumberInput.addEventListener('input', ccNumberInputInputHandler);

ccExpiryInput.addEventListener('keydown', ccExpiryInputKeyDownHandler);
ccExpiryInput.addEventListener('input', ccExpiryInputInputHandler);