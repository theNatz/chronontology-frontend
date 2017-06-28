var FrontPage = function() {

    var searchInput = element(by.id('search-form')).element(by.css('input'));
    var searchButton = element(by.id('search-form')).element(by.css('button'));
    this.load = function() {
        var url = '/';
        browser.get(url);
    };

    this.getSearchInput = function() {
        return searchInput;
    };

    this.clickSearchButton = function () {
        return searchButton.click();
    }
};

module.exports = new FrontPage();