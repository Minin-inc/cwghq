// 파일 경로 기능 테스트 2단계: Backbone View 초기화 확인용 코드
console.log('--- Step 2 Test: Backbone 스크립트가 로드되었습니다. ---');

try {
    var Integration = Backbone.View.extend({
        initialize: function(options) {
            // 이 부분이 실행된다면, 다우오피스가 View를 성공적으로 초기화했다는 뜻입니다.
            console.log('--- Step 2 Test: 성공! Integration.initialize() 함수가 호출되었습니다! ---');
            alert('Backbone View가 성공적으로 초기화되었습니다!');
        }
    });

    console.log('--- Step 2 Test: Integration View가 문제없이 정의되었습니다. ---');

} catch (error) {
    console.error('--- Step 2 Test: 실패! Backbone.View 정의 중 에러 발생:', error);
    alert('Backbone View를 정의하는 중 에러가 발생했습니다: ' + error.message);
}
