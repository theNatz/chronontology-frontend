var frontPage = require('./pages/front.page');
var helper = require('./helper');

describe('front page spec', function() {

    beforeEach(function(){
        frontPage.load();
    });

    it('search wildcard, expect search result view', function() {
        helper.typeIn(frontPage.getSearchInput(), '*');
        frontPage.clickSearchButton();

        expect(element(by.css('div[ng-controller=SearchController]')).isPresent());
    });
});
