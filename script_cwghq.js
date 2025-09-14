// ★★★★★ 디버깅용 통합 스크립트 ★★★★★

function mainScriptLogic() {
    console.log("메인 스크립트: 실행 시작.");

    if (window.daouFormObserver) {
        window.daouFormObserver.disconnect();
        console.log('통합 스크립트: 이전 감시자를 정리했습니다.');
    }

    var Integration = Backbone.View.extend({
        drawDiagonalLine: function() { /* 이전과 동일 */ },
        applyPrintStyles: function() { /* 이전과 동일 */ },
        applyLayoutA: function(signatureBlock) { /* 이전과 동일 */ },
        applyLayoutB: function(signatureBlock) { /* 이전과 동일 */ },

        formatSignatures: function() {
            let detectedFormType = '';
            const headerElement = $('header.content_top');
            if (headerElement.length > 0) {
                const titleText = headerElement.text();
                if (titleText.includes('기안')) {
                    detectedFormType = 'A';
                } else if (titleText.includes('결의')) {
                    detectedFormType = 'B';
                }
            }
            console.log("양식 타입 감지 결과:", detectedFormType || "감지 실패");

            var self = this;
            if (detectedFormType) {
                console.log(detectedFormType, "타입의 서명 로직을 적용합니다.");
                $('.sign_type1_inline').each(function() {
                    if (detectedFormType === 'A') {
                        self.applyLayoutA($(this));
                    } else if (detectedFormType === 'B') {
                        self.applyLayoutB($(this));
                    }
                });
            }
        },

        initialize: function(options) {
            console.log("Initialize 함수 호출됨.");
            this.options = options || {}; this.docModel = this.options.docModel; this.variables = this.options.variables; this.infoData = this.options.infoData;
            var self = this;
            var observer = new MutationObserver(function(mutations) {
                if (self.observerTimeout) clearTimeout(self.observerTimeout);
                self.observerTimeout = setTimeout(function() {
                    self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles();
                }, 100);
            });
            observer.observe(document.body, { childList: true, subtree: true });
            window.daouFormObserver = observer;
            setTimeout(function() {
                self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles();
            }, 200);
        },
        
        // --- 이하 생략된 함수들은 이전과 동일 ---
        render: function() { var self = this; setTimeout(function() { self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200); },
        renderViewMode: function() { var self = this; setTimeout(function() { self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200); },
        afterSave: function() { var self = this; setTimeout(function() { self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200); },
        onEditDocument: function() {}, beforeSave: function() {}, validate: function() { return true; }, getDocVariables: function() {}
    });

    new Integration();
}

// --- 실행 대기 로직 (디버깅 로그 추가) ---
var checkCount = 0;
var checker = setInterval(function() {
    checkCount++;
    // jQuery와 Backbone 라이브러리가 로드되었는지 확인
    var isReady = window.jQuery && window.Backbone;
    
    // 5초(50번) 이상 로드되지 않으면 메시지 출력 후 중단
    if (checkCount > 50 && !isReady) {
        clearInterval(checker);
        console.error("오류: 5초 이상 기다렸지만 jQuery 또는 Backbone 라이브러리를 찾을 수 없습니다. 다우오피스 페이지가 아닌 곳에서 실행되었거나, 라이브러리 로딩 방식이 예상과 다를 수 있습니다.");
        return;
    }

    // 1초마다 현재 상태를 콘솔에 출력
    if (checkCount % 10 === 0) {
        console.log("감시 로봇:", checkCount / 10, "초 경과. jQuery 상태:", !!window.jQuery, ", Backbone 상태:", !!window.Backbone);
    }
    
    if (isReady) {
        clearInterval(checker); // 확인 중단
        console.log("감시 로봇: jQuery와 Backbone을 모두 찾았습니다. 메인 스크립트를 실행합니다.");
        mainScriptLogic();    // 핵심 로직 실행
    }
}, 100);