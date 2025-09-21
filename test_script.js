// ★★★★★ Backbone.View를 사용하지 않는 독립 실행 스크립트 ★★★★★

(function() {
    'use strict';

    console.log('[독립 스크립트] 파일이 로드되었습니다.');

    // 이전에 실행된 스크립트의 감시자(Observer)가 있다면 먼저 정리합니다.
    if (window.daouPlainObserver) {
        window.daouPlainObserver.disconnect();
    }
    // 중복 실행을 막기 위한 debounce 타이머 변수
    let debounceTimeout;

    // --- 우리가 만든 모든 커스텀 함수들 ---

    function drawDiagonalLine() {
        $(".skip-sign").each(function() {
            var targetCell = $(this);
            if (targetCell.find('.diagonal-line').length === 0) {
                targetCell.css('position', 'relative').html('<div class="diagonal-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"><svg width="100%" height="100%"><line x1="100%" y1="0" x2="0" y2="100%" style="stroke:rgb(0,0,0);stroke-width:0.5" /></svg></div>');
            }
        });
    }

    function applyLayoutB(signatureBlock) { // 결의서: 도장만
        var td = signatureBlock.closest('td');
        var pElement = signatureBlock.closest('p');
        td.find('.custom-signature-container').remove();
        var dateElement = signatureBlock.find('.sign_date');
        var stampSrc = signatureBlock.find('.sign_stamp img').attr('src');
        if (dateElement.text().trim() !== '' && !signatureBlock.find('.status').text().includes('반려') && stampSrc) {
            td.css('position', 'relative');
            var container = $('<div class="custom-signature-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>');
            var signatureContent = '<img src="' + stampSrc + '" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 90%; max-height: 90%;">';
            container.html(signatureContent).appendTo(td);
            pElement.hide();
        } else {
            pElement.hide();
        }
    }
    
    // 이 외에 필요한 다른 함수들도 여기에 추가할 수 있습니다.
    // applyLayoutA, applyPrintStyles 등...

    function formatSignatures() {
		const titleText = $('header.content_top').text();
		if (titleText.includes('결의')) {
			$('.sign_type1_inline').each(function() {
				applyLayoutB($(this));
			});
		}
        // '기안' 등 다른 양식도 필요하면 여기에 추가
	}


    // --- 메인 실행 로직 ---

    function runAllCustomizations() {
        console.log('[독립 스크립트] 모든 커스텀 기능을 실행합니다.');
        drawDiagonalLine();
        formatSignatures();
        // 여기에 필요한 다른 함수 호출을 추가
    }

    // DOM(페이지)의 변경을 감시하는 감시자(Observer) 설정
    const observer = new MutationObserver((mutations) => {
        // 짧은 시간 안에 여러 변경이 감지될 경우, 마지막에 한 번만 실행 (Debounce)
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(runAllCustomizations, 150);
    });

    // body 태그의 모든 자식 요소 변화를 감시 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 전역 변수에 감시자를 저장하여 중복 생성을 방지
    window.daouPlainObserver = observer;

    // 최초 로드 시 한 번 실행 (이미 내용이 그려져 있을 경우를 대비)
    setTimeout(runAllCustomizations, 300);

})();
