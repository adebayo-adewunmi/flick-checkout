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
		location.reload();
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
	}
}