 $(document).ready(function() {
            var backgroundMusic = $('#background-music')[0];
            var musicButton = $('#music-button');
            var musicIcon = $('#music-icon');
            var isMusicPlaying = sessionStorage.getItem('isMusicPlaying') === 'true';

            musicButton.click(function() {
                if (isMusicPlaying) {
                    backgroundMusic.pause();
                } else {
                    backgroundMusic.play();
                }
                isMusicPlaying = !isMusicPlaying;
                sessionStorage.setItem('isMusicPlaying', isMusicPlaying);
            });
        });