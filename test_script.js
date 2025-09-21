// 아주 간단한 테스트용 스크립트
var Integration = Backbone.View.extend({
    
    initialize: function(options) {
        // 1. 이 스크립트가 실행되었다는 명확한 증거를 콘솔에 남깁니다.
        console.log('★★★ 심플 테스트 스크립트가 성공적으로 실행되었습니다! ★★★');

        // 2. 화면에 아주 확실한 시각적 변화를 줍니다.
        setTimeout(function() {
            // body 태그의 배경색을 연한 노란색으로 변경합니다.
            document.body.style.backgroundColor = 'lightyellow';
        }, 500); // 0.5초 후 실행
    }

});
