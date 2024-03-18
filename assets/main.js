// Hàm contructor function

function validator (options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}
    // Hàm thực hiện validate(xác nhận)
    function validate (inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message') // lấy thẻ span trong input 
        // console.log(inputElement.value)  // lấy giá trị người dùng nhập
        var errorMessage;
         // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector]
        
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector +  ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) {
                break;
            }
        }

        
        if(errorMessage) {
            //console.log(inputElement.parentElement) // lấy thẻ cha của inputElement
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }
    var formElement = document.querySelector(options.form)

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                } 
            })

            
            if (isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                var formValues =Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type) {
                        case 'radio':
                        case 'checkbox':
                            if(input.matches(':checked')) {
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                            } else {
                                values[input.name] = '';
                            }
                            
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values
                }, {})
                    options.onSubmit(formValues)
                }
            } else {
                formElement.submit()
            }
        }
        // Lắng nghe các sự kiện trong form
        options.rules.forEach(function (rule) {
            
            if (Array.isArray(selectorRules[rule.selector])) {  // nếu selectorRules là mảng
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement) {
                // xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                // Xử lý mỗi khi  người dùng nhập vào input

                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}


// Định nghĩa 
validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            // Nguyên tắc của các rule: 1.Khi có lỗi trả ra message lỗi; 2. Khi hợp lệ thì không trả ra gì ca
            return regex.test(value) ? undefined : message || ' Xin vui lòng nhập email đúng định dạng!'
            
        }
    }
}

validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Xin vui lòng nhập giá trị!'
        }
    }
}

validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Xin vui lòng nhập tối thiểu ${min} kí tự!`
        }
    }
}

validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        }
    }
}