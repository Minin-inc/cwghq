// ★★★★★ 최종 통합 스크립트 (자동 인식 버전) ★★★★★

// 이전에 실행된 스크립트의 감시자(Observer)가 있다면 먼저 정리합니다.
if (window.daouFormObserver) {
    window.daouFormObserver.disconnect();
    console.log('통합 스크립트: 이전 감시자를 정리했습니다.');
}

var Integration = Backbone.View.extend({
    // --- 공통 보조 함수 ---

    // 빈 결재란에 대각선 그리기
    drawDiagonalLine: function() {
        $(".skip-sign").each(function() {
            var targetCell = $(this);
            if (targetCell.find('.diagonal-line').length === 0) {
                targetCell.css('position', 'relative');
                var svgLine = '<div class="diagonal-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">' +
                              '<svg width="100%" height="100%">' +
                              '<line x1="100%" y1="0" x2="0" y2="100%" style="stroke:rgb(0,0,0);stroke-width:0.5" />' +
                              '</svg>' +
                              '</div>';
                targetCell.html(svgLine);
            }
        });
    },
    // 인쇄 시 배경색 등이 제대로 나오게 하는 스타일 적용
    applyPrintStyles: function() {
        $('td[style*="background"]').each(function() {
            $(this).css({
                '-webkit-print-color-adjust': 'exact',
                'print-color-adjust': 'exact'
            });
        });
    },

    // --- 레이아웃 A 로직 (이름 + 도장) ---
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
                '<span class="final-name" style="position: absolute; top: 50%; left: 35%; transform: translate(-50%, -50%); font-size: 13pt; font-family: 바탕; letter-spacing: 1px; white-space: nowrap;">' + name + '</span>' +
                '<img src="' + stampSrc + '" style="position: absolute; top: 50%; left: 75%; transform: translate(-50%, -50%); height: 30px; width: auto; max-width: 100%;">';

            container.html(signatureContent);
            td.append(container);
        }
    },

    // --- 레이아웃 B 로직 (도장만 중앙에) ---
    applyLayoutB: function(signatureBlock) {
        var statusElement = signatureBlock.closest('td').find('.status');
        var dateElement = signatureBlock.find('.sign_date');
        var containerTd = signatureBlock.closest('td');
        var pElement = containerTd.find('p');
        
        containerTd.find('.custom-signature-container, .final-stamp-image').remove();

        if (dateElement.text().trim() !== '' || statusElement.text().trim() !== '') {
            var isRejected = statusElement.text().includes('반려');

            if (!isRejected) { // 승인 시
                var stampImg = signatureBlock.find('.sign_stamp img');
                if (stampImg.length > 0) {
                    stampImg.detach().addClass('final-stamp-image');
                    containerTd.append(stampImg);
                    pElement.hide();
                }
                var finalStamp = containerTd.find('.final-stamp-image');
                containerTd.css('position', 'relative');
                finalStamp.css({
                    'position': 'absolute', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)',
                    'max-width': '90%', 'max-height': '90%', 'width': 'auto', 'height': 'auto'
                });
            } else { // 반려 시
                pElement.show();
                signatureBlock.find('.sign_tit_wrap').show();
                signatureBlock.find('.sign_stamp').hide();
                signatureBlock.find('.sign_rank, .sign_name, .sign_date').show();
            }
        } else { // 결재 전
            pElement.hide();
        }
    },

    // --- 메인 서명 처리 함수 (라우터) ---
    formatSignatures: function() {
        // --- 1. 양식 제목을 확인하여 타입 자동 감지 ---
        let detectedFormType = '';
        const titleText = $('header.content_top h1').text();

        if (titleText.includes('기안')) {
            detectedFormType = 'A';
        } else if (titleText.includes('결의')) {
            detectedFormType = 'B';
        }

        // --- 2. 감지된 타입에 따라 로직 실행 ---
        var self = this;
        // 감지된 경우에만 서명 로직 실행
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
    
    render: function() {
        var self = this;
        setTimeout(function() { self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200);
    },
    renderViewMode: function() {
        var self = this;
        setTimeout(function() { self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200);
    },
    afterSave: function() {
        var self = this;
        setTimeout(function() { self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200);
    },
    onEditDocument: function() {}, beforeSave: function() {}, validate: function() { return true; }, getDocVariables: function() {}
});

return Integration;