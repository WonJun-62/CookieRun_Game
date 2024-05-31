$(document).ready(function() {
    $('body').addClass('fade-in');

    function goToPage(url) {
        $('body').addClass('fade-out'); 
        setTimeout(function() {
            window.location.href = url; 
        }, 500); 
    }

    $('.start-button').click(function() {
        goToPage('level.html');
    });

    $('.rules-button').click(function() {
        goToPage('rule.html');
    });

    // 추가된 부분

    var video = $('video');
    var pageWrapper = $('#page-wrapper');
    var skipButton = $('#skip-button');
    var backgroundMusic = $('#background-music')[0];
    var musicButton = $('#music-button');
    var isMusicPlaying = false;
    var musicButtonImage = $('#music-button img');

    pageWrapper.hide();

    video.on('ended', function() {
        pageWrapper.fadeIn(1000); 
        video.remove(); 
        skipButton.remove(); 
    });

    skipButton.click(function() {
        pageWrapper.fadeIn(1000); 
        video.remove(); 
        skipButton.remove(); 
    });

    musicButton.click(function() {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            musicButtonImage.attr('src', 'audio_off.png');
        } else {
            backgroundMusic.play();
            musicButtonImage.attr('src', 'audio_on.png');
        }
        isMusicPlaying = !isMusicPlaying;
        sessionStorage.setItem('isMusicPlaying', isMusicPlaying);
    });

});