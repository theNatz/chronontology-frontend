var EC = protractor.ExpectedConditions;

var Helper = function () {

    this.typeIn = function (inputField, text) {
        browser.wait(EC.visibilityOf(inputField), 5000);
        inputField.clear();
        for (var i in text) {
            inputField.sendKeys(text[i]);
        }
        return inputField;
    };
};

module.exports = new Helper();

