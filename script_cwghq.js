// ★★★★★ 최종 통합 스크립트 (일반 스크립트 버전) ★★★★★

// 이전에 실행된 스크립트의 감시자(Observer)가 있다면 먼저 정리합니다.
if (window.daouFormObserver) {
    window.daouFormObserver.disconnect();
    console.log('통합 스크립트: 이전 감시자를 정리했습니다.');
}

var Integration = Backbone.View.extend({
    // --- 공통 보조 함수 ---
    drawDiagonalLine: function() {
        $(".skip-sign").each(function() {
            var targetCell = $(this);
            if (targetCell.find('.diagonal-line').length === 0) {
                targetCell.css('position', 'relative');
                var svgLine = '<div class="diagonal-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">' +
                              '<svg width="100%" height="100%">' +
                              '<line x1="100%" y1="0" x2="0" y2="100%" style="stroke:rgb(0,0,0);stroke-width:0.5" />' +
                              '</svg>' +
                              '</div>';
                targetCell.html(svgLine);
            }
        });
    },
    applyPrintStyles: function() {
        $('td[style*="background"]').each(function() {
            $(this).css({
                '-webkit-print-color-adjust': 'exact',
                'print-color-adjust': 'exact'
            });
        });
    },

    // --- 레이아웃 A 로직 (기안문: 이름 + 도장) ---
    applyLayoutA: function(signatureBlock) {
        var td = signatureBlock.closest('td');
        td.find('.custom-signature-container, .final-stamp-image').remove();

        var name = signatureBlock.find('.sign_name').text().trim();
        var stampSrc = signatureBlock.find('.sign_stamp img').attr('src');

        if (name && stampSrc) {
            td.css('position', 'relative');
            var container = $('<div class="custom-signature-container"></div>');
            container.css({
                'position': 'absolute', 'top': '0', 'left': '0', 'width': '100%', 'height': '100%'
            });
            var signatureContent =
                '<span class="final-name" style="position: absolute; top: 50%; left: 30%; transform: translate(-50%, -50%); font-size: 13pt; font-family: 바탕; letter-spacing: 1px; white-space: nowrap;">' + name + '</span>' +
                '<img src="' + stampSrc + '" style="position: absolute; top: 50%; left: 70%; transform: translate(-50%, -50%); height: 30px; width: auto; max-width: 100%;">';
            container.html(signatureContent);
            td.append(container);
        }
    },

    // --- 레이아웃 B 로직 (결의서: 도장만 중앙에) ---
    applyLayoutB: function(signatureBlock) {
        var td = signatureBlock.closest('td');
        var pElement = signatureBlock.closest('p');
        td.find('.custom-signature-container, .final-stamp-image').remove();

        var dateElement = signatureBlock.find('.sign_date');
        var stampSrc = signatureBlock.find('.sign_stamp img').attr('src');

        if (dateElement.text().trim() !== '' && !signatureBlock.find('.status').text().includes('반려') && stampSrc) {
            td.css('position', 'relative');
            var container = $('<div class="custom-signature-container"></div>');
            container.css({
                'position': 'absolute', 'top': '0', 'left': '0', 'width': '100%', 'height': '100%'
            });
            var signatureContent =
                '<img src="' + stampSrc + '" class="final-stamp-image" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 90%; max-height: 90%; width: auto; height: auto;">';
            
            container.html(signatureContent);
            td.append(container);
            pElement.hide();
        } else {
            pElement.hide();
        }
    },

    // --- 메인 서명 처리 함수 (라우터) ---
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

        var self = this;
        if (detectedFormType) {
            $('.sign_type1_inline').each(function() {
                if (detectedFormType === 'A') {
                    self.applyLayoutA($(this));
                } else if (detectedFormType === 'B') {
                    self.applyLayoutB($(this));
                }
            });
        }
    },

    // --- 공통 초기화 및 라이프사이클 함수 ---
    initialize: function(options) {
        this.options = options || {}; this.docModel = this.options.docModel; this.variables = this.options.variables; this.infoData = this.options.infoData;
        var self = this;
        var observer = new MutationObserver(function(mutations) {
            if (self.observerTimeout) clearTimeout(self.observerTimeout);
            self.observerTimeout = setTimeout(function() {
                self.formatSignatures();
                self.drawDiagonalLine();
                self.applyPrintStyles();
            }, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        window.daouFormObserver = observer;
        setTimeout(function() {
            self.formatSignatures();
            self.drawDiagonalLine();
            self.applyPrintStyles();
        }, 200);
    },
    
    render: function() { /* ...생략... */ },
    renderViewMode: function() { /* ...생략... */ },
    afterSave: function() { /* ...생략... */ },
    onEditDocument: function() {}, beforeSave: function() {}, validate: function() { return true; }, getDocVariables: function() {}
});

// ★★★★★ 변경된 부분 ★★★★★
// return Integration;  // 이 줄을 삭제하고,
new Integration();      // 이 줄을 추가하여 스크립트가 스스로 실행되도록 합니다.