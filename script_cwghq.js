// ★★★★★ 최종 통합 스크립트 (B타입 로직 수정본 + 에디터 기본값 설정 추가) ★★★★★

// 이전에 실행된 스크립트의 감시자(Observer)가 있다면 먼저 정리합니다.
if (window.daouFormObserver) {
    window.daouFormObserver.disconnect();
    console.log('통합 스크립트: 이전 감시자를 정리했습니다.');
}

var Integration = Backbone.View.extend({
    // --- 추가된 함수: 에디터 기본 스타일 설정 ---
    setDefaultEditorStyles: function() {
        // 1. 에디터를 포함하는 <td>의 수직 정렬을 'top'으로 변경
        // valign 속성 대신 CSS를 사용하여 더 안정적으로 제어합니다.
        var editorCell = $('span[data-dsl="{{editor}}"]').closest('td');
        if (editorCell.length > 0 && editorCell.css('vertical-align') !== 'top') {
            editorCell.css('vertical-align', 'top');
            console.log('에디터 셀의 수직 정렬을 top으로 변경했습니다.');
        }

        // 2. DEXT5 에디터 iframe을 찾아 내용에 기본 스타일 적용
        // ID가 'dext_frame_editorForm'으로 시작하는 모든 iframe을 대상으로 하여 여러 에디터에 대응
        var editorIframe = $('iframe[id^="dext_frame_editorForm"]');
        if (editorIframe.length > 0) {
            editorIframe.each(function() {
                var iframe = $(this);
                // iframe 로드 완료 시점에 스타일을 적용해야 가장 안정적입니다.
                // 중복 실행을 방지하기 위해 네임스페이스를 사용한 이벤트 핸들러를 사용합니다.
                iframe.off('load.editorDefaults').on('load.editorDefaults', function() {
                    try {
                        var body = $(this).contents().find('body');
                        // 스타일이 아직 적용되지 않았을 경우에만 실행
                        if (body.length > 0 && body.css('font-size') !== '13pt') {
                            body.css({
                                'font-size': '13pt'
                            });
                            console.log($(this).attr('id') + ' 에디터의 기본 폰트 크기를 13pt로 설정했습니다.');
                        }
                    } catch (e) {
                        console.error('에디터(iframe) 내용 접근 중 오류 발생:', e);
                    }
                });

                // 이미 로드된 iframe에 대해서도 스타일을 적용하기 위한 시도
                try {
                    var body = iframe.contents().find('body');
                    if (body.length > 0 && body.css('font-size') !== '13pt') {
                         body.css({
                            'font-size': '13pt'
                        });
                    }
                } catch (e) {
                     // 로드 전 접근 시 오류가 날 수 있으나, 위 load 이벤트에서 처리되므로 무시합니다.
                }
            });
        }
    },

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
                '<span class="final-name" style="position: absolute; top: 50%; left: 35%; transform: translate(-50%, -50%); font-size: 13pt; font-family: 바탕; letter-spacing: 1px; white-space: nowrap;">' + name + '</span>' +
                '<img src="' + stampSrc + '" style="position: absolute; top: 50%; left: 75%; transform: translate(-50%, -50%); height: 30px; width: auto; max-width: 100%;">';
            container.html(signatureContent);
            td.append(container);
        }
    },

    // --- ★★★ 레이아웃 B 로직 수정 (더 안정적인 '생성' 방식으로 변경) ★★★ ---
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

    // --- 공통 초기화 및 라이프사이클 함수 (★★수정된 부분★★) ---
    initialize: function(options) {
        this.options = options || {}; this.docModel = this.options.docModel; this.variables = this.options.variables; this.infoData = this.options.infoData;
        var self = this;
        var observer = new MutationObserver(function(mutations) {
            if (self.observerTimeout) clearTimeout(self.observerTimeout);
            self.observerTimeout = setTimeout(function() {
                self.setDefaultEditorStyles(); // 에디터 스타일 함수 호출 추가
                self.formatSignatures();
                self.drawDiagonalLine();
                self.applyPrintStyles();
            }, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        window.daouFormObserver = observer;
        setTimeout(function() {
            self.setDefaultEditorStyles(); // 에디터 스타일 함수 호출 추가
            self.formatSignatures();
            self.drawDiagonalLine();
            self.applyPrintStyles();
        }, 200);
    },
    
    render: function() {
        var self = this;
        setTimeout(function() { self.setDefaultEditorStyles(); self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200); // 호출 추가
    },
    renderViewMode: function() {
        var self = this;
        setTimeout(function() { self.setDefaultEditorStyles(); self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200); // 호출 추가
    },
    afterSave: function() {
        var self = this;
        setTimeout(function() { self.setDefaultEditorStyles(); self.formatSignatures(); self.drawDiagonalLine(); self.applyPrintStyles(); }, 200); // 호출 추가
    },
    onEditDocument: function() {}, beforeSave: function() {}, validate: function() { return true; }, getDocVariables: function() {}
});

window.Integration = Integration; // <-- 이 한 줄을 추가!
