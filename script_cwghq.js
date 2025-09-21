// ★★★★★ 디버깅 코드가 추가된 스크립트 ★★★★★

var Integration = Backbone.View.extend({
    // --- 추가된 함수: 에디터 기본 스타일 설정 ---
    setDefaultEditorStyles: function() {
        var editorCell = $('span[data-dsl="{{editor}}"]').closest('td');
        if (editorCell.length > 0) {
            editorCell.css('vertical-align', 'top');
        }
        var editorIframe = $('iframe[id^="dext_frame_editorForm"]');
        if (editorIframe.length > 0) {
            editorIframe.each(function() {
                $(this).on('load.editorDefaults', function() {
                    try {
                        var body = $(this).contents().find('body');
                        if (body.length > 0 && body.css('font-size') !== '13pt') {
                            body.css({ 'font-size': '13pt' });
                            console.log('[스크립트 디버그] 에디터 폰트 크기 설정 완료.');
                        }
                    } catch (e) {}
                });
                try {
                    var body = $(this).contents().find('body');
                    if (body.length > 0 && body.css('font-size') !== '13pt') {
                       body.css({ 'font-size': '13pt' });
                    }
                } catch (e) {}
            });
        }
    },

    // --- 공통 보조 함수 ---
    drawDiagonalLine: function() {
        console.log('[스크립트 디버그] drawDiagonalLine 함수 실행 시도.');
        var targets = $(".skip-sign");
        console.log('[스크립트 디버그] .skip-sign 요소 ' + targets.length + '개 찾음.');
        targets.each(function() {
            var targetCell = $(this);
            if (targetCell.find('.diagonal-line').length === 0) {
                targetCell.css('position', 'relative');
                var svgLine = '<div class="diagonal-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"><svg width="100%" height="100%"><line x1="100%" y1="0" x2="0" y2="100%" style="stroke:rgb(0,0,0);stroke-width:0.5" /></svg></div>';
                targetCell.html(svgLine);
                console.log('[스크립트 디버그] 대각선 1개 그림.');
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
            var container = $('<div class="custom-signature-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>');
            var signatureContent = '<span class="final-name" style="position: absolute; top: 50%; left: 35%; transform: translate(-50%, -50%); font-size: 13pt; font-family: 바탕; letter-spacing: 1px; white-space: nowrap;">' + name + '</span>' + '<img src="' + stampSrc + '" style="position: absolute; top: 50%; left: 75%; transform: translate(-50%, -50%); height: 30px; width: auto; max-width: 100%;">';
            container.html(signatureContent);
            td.append(container);
        }
    },

    // --- 레이아웃 B 로직 (결의서: 도장만) ---
    applyLayoutB: function(signatureBlock) {
        var td = signatureBlock.closest('td');
        var pElement = signatureBlock.closest('p');
        td.find('.custom-signature-container, .final-stamp-image').remove();
        var dateElement = signatureBlock.find('.sign_date');
        var stampSrc = signatureBlock.find('.sign_stamp img').attr('src');
        if (dateElement.text().trim() !== '' && !signatureBlock.find('.status').text().includes('반려') && stampSrc) {
            td.css('position', 'relative');
            var container = $('<div class="custom-signature-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>');
            var signatureContent = '<img src="' + stampSrc + '" class="final-stamp-image" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 90%; max-height: 90%; width: auto; height: auto;">';
            container.html(signatureContent);
            td.append(container);
            pElement.hide();
        } else {
            pElement.hide();
        }
    },

    // --- 메인 서명 처리 함수 (라우터) ---
    formatSignatures: function() {
        console.log('[스크립트 디버그] formatSignatures 함수 실행 시도.');
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
        console.log('[스크립트 디버그] 문서 타입 "' + detectedFormType + '"으로 감지.');
        var self = this;
        var signatureElements = $('.sign_type1_inline');
        console.log('[스크립트 디버그] .sign_type1_inline 요소 ' + signatureElements.length + '개 찾음.');
        if (detectedFormType) {
            signatureElements.each(function() {
                if (detectedFormType === 'A') {
                    self.applyLayoutA($(this));
                } else if (detectedFormType === 'B') {
                    self.applyLayoutB($(this));
                }
            });
        }
    },

    // --- 공통 초기화 및 라이프사이클 함수 ---
    runAllCustomizations: function(caller) {
        console.log('[스크립트 디버그] === 모든 커스텀 기능 실행 (' + caller + ') ===');
        this.setDefaultEditorStyles();
        this.formatSignatures();
        this.drawDiagonalLine();
        this.applyPrintStyles();
    },

    initialize: function(options) {
        console.log('[스크립트 디버그] initialize 함수 실행됨.');
        this.options = options || {}; this.docModel = this.options.docModel; this.variables = this.options.variables; this.infoData = this.options.infoData;
        var self = this;

        // MutationObserver: DOM 변경을 감지하여 함수들을 다시 실행
        var observer = new MutationObserver(function(mutations) {
            console.log('[스크립트 디버그] MutationObserver가 DOM 변경을 감지함!');
            if (self.observerTimeout) clearTimeout(self.observerTimeout);
            self.observerTimeout = setTimeout(function() {
                self.runAllCustomizations('Observer');
            }, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        window.daouFormObserver = observer;

        // 초기 로드 시 실행
        setTimeout(function() {
            self.runAllCustomizations('initialize');
        }, 300); // <-- 지연 시간을 200ms에서 300ms로 약간 늘렸습니다.
    },
    
    render: function() {
        console.log('[스크립트 디버그] render 함수 실행됨.');
        var self = this;
        setTimeout(function() { self.runAllCustomizations('render'); }, 300);
    },
    renderViewMode: function() {
        console.log('[스크립트 디버그] renderViewMode 함수 실행됨.');
        var self = this;
        setTimeout(function() { self.runAllCustomizations('renderViewMode'); }, 300);
    },
    afterSave: function() {
        console.log('[스크립트 디버그] afterSave 함수 실행됨.');
        var self = this;
        setTimeout(function() { self.runAllCustomizations('afterSave'); }, 300);
    },
    onEditDocument: function() {}, beforeSave: function() {}, validate: function() { return true; }, getDocVariables: function() {}
});
