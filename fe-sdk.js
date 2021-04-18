(function (window){




    /*
	CONSTANTS
	*/
    var RAVE_CONSTANTS = {};
    RAVE_CONSTANTS.SDK_INPUT_SELECTOR = '.rave-sdk-input';
    RAVE_CONSTANTS.SDK_MODAL_AUDITID = '';
    RAVE_CONSTANTS.API_BASE_URL = 'https://rave-api-v2.herokuapp.com';
    RAVE_CONSTANTS.EVENT_LOGGER_BASE_URL = 'https://flw-events-ge.herokuapp.com/event/create';
    RAVE_CONSTANTS.EVENT_LOGGER_TOKEN = 'flw_event_wt_e5fe4da063edacb29ec19f';
    RAVE_CONSTANTS.ENCRYPTION_PUBLIC_KEY = 'baA/RgjURU3I0uqH3iRos3NbE8fT+lP8SDXKymsnfdPrMQAEoMBuXtoaQiJ1i5tuBG9EgSEOH1LAZEaAsvwClw==';
    RAVE_CONSTANTS.ENDPOINTS = {
        fee:'/flwv3-pug/getpaidx/api/fee',
        validate_card_charge:'/flwv3-pug/getpaidx/api/validatecharge?use_polling=1',
        limit:'/flwv3-pug/getpaidx/api/limit',
        validate_account_charge:'/flwv3-pug/getpaidx/api/validate?use_polling=1',
        mpesa_status_verification:'/flwv3-pug/getpaidx/api/verify/mpesa',
        ussd_status_verification: '/flwv3-pug/getpaidx/api/verify/ussd',
        payattitude_status_verification: '/flwv3-pug/getpaidx/api/verify/payattitude',
        banktransfer_status_verification: '/flwv3-pug/getpaidx/api/verify/pwbt',
        charge: '/flwv3-pug/getpaidx/api/charge',
        charge_secure_auth: '/flwv3-pug/getpaidx/api/secureauthcharge-pk',
        charge_polling:'/flwv3-pug/getpaidx/api/charge?use_polling=1',
        ip:'/flwv3-pug/getpaidx/api/ip',
        device_lookup:'/v2/gpx/users/lookup',
        account_lookup:'/v2/gpx/mandates/lookup',
        send_otp:'/v2/gpx/users/send_otp',
        send_mandate_otp:'/v2/gpx/mandates/send_otp',
        validate_barter:'/v2/gpx/barter/users/lookup',
        stats: '/v2/gpx/payment_options/stats',
        mpesa_override: '/v2/gpx/mpesa/authoverride',
        loan_eligibility: '/v2/gpx/loans/eligibility_check',
        credits_charge: '/flwv3-pug/getpaidx/api/credits_charge',
        validate_uk: '/flwv3-pug/getpaidx/api/uk_collections/validate',
        // secureauth_lookup: '/v2/secureauth/lookup',
        secureauth_lookup: '/v2/secureauth/web-lookup',
        // secureauth_enroll: '/v2/secureauth/enroll',
        secureauth_enroll: '/v2/secureauth/enroll-with-tx',
        secureauth_verify: '/v2/secureauth/verify',
        secureauth_sendotp: '/v2/secureauth/sendotp',
        secureauth_resendotp: '/v2/secureauth/resendotp',
        secureauth_forgotpin: '/v2/secureauth/forgotpin',
        secureauth_updatepin: '/v2/secureauth/updatepin',
        savedcard_remove: '/v2/gpx/users/remove'
    };

    //**


    function sdk(sdk_config){


        sdk_config = sdk_config || {};

        // if(!sdk_config.public_key) throw new Error("No public key passed");
        var _instance = this;
        _instance.raw_config = sdk_config;
        _instance.public_key = sdk_config.public_key;
        _instance.QUERY_STRING_DATA = sdk_config.QUERY_STRING_DATA || {};
        _instance.modal_auditid = sdk_config.modal_auditid || RAVE_CONSTANTS.SDK_MODAL_AUDITID;
        _instance.event_logger_key = sdk_config.event_logger_key || RAVE_CONSTANTS.EVENT_LOGGER_TOKEN;
        _instance.api_base_url = sdk_config.api_base_url || RAVE_CONSTANTS.API_BASE_URL;
        _instance.logger_base_url = sdk_config.logger_base_url || RAVE_CONSTANTS.EVENT_LOGGER_BASE_URL;
        _instance.logger_token = sdk_config.logger_token || RAVE_CONSTANTS.EVENT_LOGGER_TOKEN;
        _instance.encryption_public_key = sdk_config.encryption_public_key || RAVE_CONSTANTS.ENCRYPTION_PUBLIC_KEY;
        _instance.endpoints = {};

        for(var endpoint in RAVE_CONSTANTS.ENDPOINTS){
            _instance.endpoints[endpoint] = _instance.api_base_url + RAVE_CONSTANTS.ENDPOINTS[endpoint];
        }

        // var getUniqueSessionID = (function () {
        //     let id = null;
        //     const metaElem = Array.prototype.slice.call(document.querySelectorAll('meta[name=usid]'))[0];

        //     return function _sessionID () {
        //         return id || (id = (metaElem && metaElem.content) || null);
        //     };
        // })();

        var getMerchantIdentifier = (function () {
            let id = null;
            const metaElem = Array.prototype.slice.call(document.querySelectorAll('meta[name=merchant_identifier]'))[0];

            return function _identifier() {
                return id || (id = (metaElem && metaElem.content) || null);
            };
        })();

        var asciiSanitize = (function () {
            const NON_ASCII_REGEX = /[^\x00-\x7F]/;

            return function _sanitizer(value) {
                return NON_ASCII_REGEX.test(value) ? encodeURIComponent(value) : value;
            };
        })();


        //utils
        //from https://gist.github.com/DiegoSalazar/4075533
        // takes the form field value and returns true on valid number
        function valid_credit_card(value) {
            // accept only digits, dashes or spaces
            if (/[^0-9-\s]+/.test(value)) return false;

            // The Luhn Algorithm. It's so pretty.
            var nCheck = 0, nDigit = 0, bEven = false;
            value = value.replace(/\D/g, "");

            for (var n = value.length - 1; n >= 0; n--) {
                var cDigit = value.charAt(n),
                    nDigit = parseInt(cDigit, 10);

                if (bEven) {
                    if ((nDigit *= 2) > 9) nDigit -= 9;
                }

                nCheck += nDigit;
                bEven = !bEven;
            }

            return (nCheck % 10) == 0;
        }

        _instance.validate_credit_card = valid_credit_card;


        function valid_exp_date(expdate){

            var date_parts = expdate.split('/');
            var month = date_parts[0].trim();
            var year  = date_parts[1].trim();

            var today = new Date();
            var current_year = today.getFullYear().toString();
            var current_year_l2 = current_year.substr(2);
            var current_month = today.getMonth() + 1;

            if(!year) return false;

            //console.log("Passes null year check");

            if(year.length > 4 || month.length > 2) return false;

            //console.log("passes year and month length check")

            if(year.length == 4){

                return (parseInt(year) > parseInt(current_year)) || (current_month <= parseInt(month) &&  parseInt(year) == parseInt(current_year) );
            }

            //console.log("year is not 4 characters");

            return (parseInt(year) > parseInt(current_year_l2)) || (current_month <= parseInt(month) &&  parseInt(year) == parseInt(current_year_l2) );



        }

        _instance.validate_card_expiry = valid_exp_date;

        //make request
        function make_request( request_config ){

            var method = request_config.method || "post";

            if(request_config.pre_request) {
                //pass request config obeject as well as instance object. Possible to augument with public key e.t.c.
                request_config.pre_request(request_config, _instance);
            }

            return $[method](request_config.url, request_config.data)

        }

        //helper get
        function get(config){

            config.method = 'get';
            return make_request(config);

        }

        //helper post
        function post(config){

            config.method = 'post';
            return make_request(config);

        }



        //req prop
        _instance.request = {

            _raw:make_request,
            get:get,
            post:post

        }


        //helper poll
        function poll_request(config){

            var max_poll_threshold = config.poll_threshold || 10;
            var poll_threshold = 1;
            var run_next_request_every = config.poll_wait_time || 1500;
            var method = config.method || 'post';
            var poll_timeout;
            var halt_poll_flag = false;

            function halt_poll() {
                // console.log(poll_timeout);
                clearTimeout(poll_timeout);
                halt_poll_flag = true;
            };

            function run_poll(){

                _instance
                    .request[method](config)
                    .done( function (data) {

                        config.on_poll_data(data, {halt_poll:halt_poll, current_threshold:poll_threshold});

                    })
                    .fail( function (error) {

                        config.on_poll_error(error, {halt_poll:halt_poll, current_threshold:poll_threshold});

                    })
                    .always( function () {

                        if(poll_threshold == max_poll_threshold) halt_poll();
                        else if(!halt_poll_flag){
                            poll_threshold++;
                            poll_timeout = setTimeout(run_poll, run_next_request_every);
                        }

                    })

            }
            run_poll();



        }
        _instance.request.poll_request = poll_request;



        //log events
        //{name, label, comment, timestamp}
        function log_event(event){

            event.token = _instance.event_logger_key;

            _instance.request.post({url:_instance.logger_base_url, data:event});

        }

        _instance.log_event = log_event;


        function get_parameters(_config) {


            var config = _config || {};
            var container = (config.selector || RAVE_CONSTANTS.SDK_INPUT_SELECTOR);

            //re-work

            var children_selectors = [
                container + ' input',
                container + ' select',
                container + ' textarea'
            ];

            if(config.custom_child_elem){
                children_selectors.push(container + ' ' + config.custom_child_elem)
            }
            var children = $(children_selectors.join(","));
            //console.log(children);
            var parameters = {};
            children.each( function () {

                var child = $(this);
                var child_name = child.attr('name');
                var child_value = child.val();

                /*
				Run config function to do augmentation or special transformations
				*/
                if(config && config.param_transformations && config.param_transformations[child_name]){

                    child_value = config.param_transformations[child_name](child);
                }
                //**

                // console.log(child_name);
                parameters[child_name] = child_value;

            })

            return parameters;

        }
        _instance.get_parameters = get_parameters;

        _instance.get_fees = function (config) {

            config.url = _instance.endpoints.fee;
            config.data && (config.data.PBFPubKey = config.data.PBFPubKey || _instance.public_key);
            return _instance.request.post(config);

        }

        _instance.handle_charge_response = function (data, config){


            if(!data) throw new Error('Invalid response');

            if(data && data.message == "LONG-REQ"){

                config && config.on_long_request(data, _instance);
                return;
            }

            var response_meat = data.data;

            if(response_meat.suggested_auth){


                var suggested_auth = response_meat.suggested_auth;

                if(suggested_auth == "PIN"){

                    config && config.on_pin_suggested_auth(data, _instance);

                }
                else if(suggested_auth == "NOAUTH_INTERNATIONAL"){

                    config && config.on_avs_suggested_auth(data, _instance);

                }
                else if(suggested_auth == "AVS_VBVSECURECODE"){

                    config && config.on_avs_suggested_auth(data, _instance);

                }
                else if(suggested_auth == "AVS"){

                    config && config.on_avs_suggested_auth(data, _instance);

                }
                else{

                    config && config.on_suggested_auth(data, _instance);

                }


                return;

            }


            var charge_code = response_meat.chargeResponseCode || response_meat.response_code || response_meat.code || (response_meat.data ? response_meat.data.code : null);
            var acct_response = response_meat.acctvalrespcode;
            var auth_model = response_meat.authModelUsed;
            var auth_url = response_meat.authurl || response_meat.link || (response_meat.data ? response_meat.data.redirect_url || response_meat.data.link : null);
            var should_do_mpesa_validation = (response_meat.paymentType == "mpesa" && ~response_meat.status.indexOf('pending'))

            if(charge_code == "00"){
                config && config.on_charge_successful &&  config.on_charge_successful(data, _instance);
            }
            else if (charge_code == "pending-capture" && response_meat.paymentType == "card" && response_meat.charge_type == "preauth") {
                config && config.on_charge_successful && config.on_charge_successful(data, _instance);
            }
            else if (charge_code == "02" && auth_model && auth_model == 'MVISA-QR') {
                config && config.on_charge_validation && config.on_charge_validation(data, _instance);
            }
            else if (charge_code == "02" && auth_model && ~['PIN', 'OTP', 'GTB_OTP', 'ACCESS_OTP'].indexOf(auth_model)) {
                config && config.on_card_otp_validation && config.on_card_otp_validation(data, _instance);
            }
            else if(charge_code == "02" && auth_url && auth_url != "NO-URL" && auth_url != "N/A"){
                config && config.on_vbv_validation && config.on_vbv_validation(data, _instance);
            }
            else if(charge_code == "02" && auth_model =="RANDOM_DEBIT" && acct_response == "RR"){
                config && config.on_charge_failed && config.on_charge_failed(data, _instance);
            }
            else if (charge_code == "02" || (response_meat.response_code === "02" && (!response_meat.data || response_meat.data.type !== 'paymentcode'))) {
                config && config.on_charge_validation && config.on_charge_validation(data, _instance);
            }
            else if (response_meat.status === "pending" && response_meat.paymentType === 'payattitude') {
                config && config.on_charge_validation && config.on_charge_validation(data, _instance);
            }
            else if(response_meat.response_code === '02' && response_meat.response_message === 'Transaction in progress' && response_meat.data && response_meat.data.type === 'paymentcode'){
                config && config.on_charge_validation && config.on_charge_validation(data, _instance);
            }
            else if(should_do_mpesa_validation){
                config && config.on_charge_validation && config.on_charge_validation(data, _instance);
            }
            else{
                config && config.on_charge_failed && config.on_charge_failed(data, _instance);
            }

        }

        _instance.charge = function (config) {
            config = Object.assign({}, config);

            if (config.data.context == 'AIRTEL' && config.data.device_key) {
                config.url = _instance.endpoints.charge_secure_auth;
            }
            else if (['USSD', 'banktransfer', 'saved-card', 'paypal', 'internetbanking', 'equitycash'].indexOf(config.data.payment_type) >= 0) {
                config.url = _instance.endpoints.charge;
            }
            else {
                config.url = _instance.endpoints.charge_polling;
            }
            //config.data && (config.data.PBFPubKey = _instance.public_key);
            // window.parent.console.log(config.data);

            if (chargeDetails['hosted_payment_unique_id'] && document.location.protocol === 'https:') {
                var _excludes = [
                    'QUERY_STRING_DATA', 'cardno', 'cvv', 'expirymonth', 'expiryyear', 'pin', 'campaign_id', 'cycle', 'country',
                    'charge_type', 'payment_page', 'payment_plan', 'payment_type', 'PBFPubKey', 'subaccounts', 'redirect_url',
                    'transaction_charge', 'transaction_charge_type'
                ];

                var endpoint = getMerchantIdentifier() === 'uber'
                    ? 'https://flutterwavestaging.com:9443/v1/payments/kyc/callback'
                    : $_isfb ? 'https://flutterwaveprod.com:9443/facebook/v1/payments/kyc/callback' : null

                endpoint && (function triggerCallback(data) {
                    var attempts = 0;
                    var MAX_ATTEMPTS = 10;

                    data = JSON.stringify(data);

                    return (function trigger() {
                        (attempts++ < MAX_ATTEMPTS) && setTimeout(function() {
                            $.ajax(endpoint, {
                                method: 'POST',
                                contentType: 'application/json; charset=UTF-8',
                                data,
                            }).fail(function(xhr) { (xhr.status !== 200) && trigger() });
                        }, fibonacci(attempts) * 50);
                    })();
                })(Object.keys(config.data).reduce(function (payload, prop) {
                    return (
                        (_excludes.indexOf(prop) < 0) &&
                        (value = config.data[prop], !(value === null || value === undefined) && (payload[prop] = value))
                    ), payload;
                }, { hosted_payment_unique_id: chargeDetails['hosted_payment_unique_id'] }));
            }

            try {
                // window.parent.console.log(config.data);
                config.data.QUERY_STRING_DATA =  _instance.QUERY_STRING_DATA;
                // config.data.modal_unique_session_id = getUniqueSessionID();

                config.data = {
                    modalauditid: config.data.modalauditid,
                    PBFPubKey:_instance.public_key,
                    client: cryptico.encrypt(JSON.stringify(config.data, (key, value) => {
                        if(key === 'meta') {
                            try {
                                value = value.map(v => ({
                                    metaname: asciiSanitize(v.metaname),
                                    metavalue: asciiSanitize(v.metavalue)
                                }));
                            } catch(e) {}
                        }

                        else if (key === 'QUERY_STRING_DATA') {
                            try {
                                value = Object.keys(value).reduce((data, key) => {
                                    data[key] = asciiSanitize(value[key]);
                                    return data;
                                }, {});
                            } catch (e) {}
                        }

                        return value;
                    }), _instance.encryption_public_key).cipher
                }

            }
            catch (e) {
                // console.log(e)
            }

            return _instance
                .request
                .post(config)
                .done( function (data) {

                    _instance.handle_charge_response(data, config);


                })
                .fail(function (data) {

                    config && config.on_server_error && config.on_server_error(data, _instance);

                })
                .always(function (data) {

                })
        }



    }

    function fibonacci(n) {
        var cache = [];
        return (function fib(n) {
            if (n > 0 && cache[n]) return cache[n];
            if (n <= 0) return (cache[n] = 0);
            if (n <= 2) return (cache[n] = 1);
            return (cache[n] = fib(n - 1) + fib(n - 2));
        })(n);
    }


    window.rave_sdk = sdk;
})(window);