$(document).ready(function() {
    // 페이지가 로드될 때 페이드 인 효과 적용
    $('body').addClass('fade-in');

    // 페이지 이동 함수
    function goToPage(url) {
        $('body').addClass('fade-out'); // 페이드 아웃 효과 추가
        setTimeout(function() {
            window.location.href = url; // 지정된 시간 후에 새로운 페이지로 이동
        }, 500); // 페이드 아웃 애니메이션 시간과 동일
    }

    // 돌아가기 버튼 클릭 시 이전 html로 이동
    $('.back-button').click(function() {
        goToPage('level2.html'); 
    });

    // 플레이어의 생명 수
    let hearts = 3;
    hearts = parseFloat(sessionStorage.getItem('hearts'));

    // 공 이미지 로드
    let ballImage = new Image();
    // ballImage.src = 'ball.jpeg'; // 공 이미지 경로
    let ballImageSrc = sessionStorage.getItem('ballImage') || 'ball.jpeg';
    ballImage.src = ballImageSrc;

    let clearBlockImage = new Image();
    let plainBlockImage = new Image();
    let specialBlockImage = new Image();
    let randomBlockImage = new Image(); // 새로운 이미지 추가
    let hit1Image = new Image(); // 1번 맞은 블록 이미지
    let hit2Image = new Image(); // 2번 맞은 블록 이미지
    let hit3Image = new Image(); // 3번 맞은 블록 이미지

    let totalImages = 7; // 이미지 개수 업데이트
    let loadedImages = 0;

    // 이미지가 로드되면 호출될 함수
    function onLoadImage() {
        loadedImages++;
        if (loadedImages === totalImages) {
            drawBlocks(); // 모든 이미지가 로드된 후에 블록을 그립니다.
        }
    }

    // 이미지 로드를 위한 이벤트 핸들러 등록
    clearBlockImage.onload = onLoadImage;
    plainBlockImage.onload = onLoadImage;
    specialBlockImage.onload = onLoadImage;
    randomBlockImage.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가
    hit1Image.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가
    hit2Image.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가
    hit3Image.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가

    // 이미지 소스 설정
    clearBlockImage.src = 'clear_block.png';
    plainBlockImage.src = 'block_yellow.png';
    specialBlockImage.src = 'special_block.png';
    randomBlockImage.src = 'block_blue.png'; // 새로운 이미지 경로 설정
    hit1Image.src = 'block_blue.png'; // 새로운 이미지 경로 설정
    hit2Image.src = 'block_red.png'; // 새로운 이미지 경로 설정
    hit3Image.src = 'block_yellow.png'; // 새로운 이미지 경로 설정

    // 캔버스 요소와 그리기 컨텍스트 설정
    let canvas = document.getElementById("myCanvars");
    let ctx = canvas.getContext('2d');

    // 캔버스 크기 설정
    canvas.width = 740;
    canvas.height = 495;

    // 블록 관련 변수 설정
    let blockRowCount = 3; // 블록 행 개수
    let blockColumnCount = 13; // 블록 열 개수
    let blockWidth = 50; // 블록 너비
    let blockHeight = 50; // 블록 높이
    let blockPadding = 2; // 블록 간격
    let blockOffsetTop = 23; // 상단 여백
    let blockOffsetLeft = 30; // 좌측 여백

    // 공의 이동 속도
    let dx = 2;
    let dy = -2;  // 공이 처음에 위로 이동하도록 설정
    dx = parseFloat(sessionStorage.getItem('dx'));
    dy = parseFloat(sessionStorage.getItem('dy')); // 공 속도 변경

    // 패들 크기
    let paddleHeight = 10;
    let paddleWidth = parseFloat(sessionStorage.getItem('paddleWidth')); // 패들 길이 업데이트
    
    // 공의 초기 위치
    let x = canvas.width / 2;
    let y = canvas.height - paddleHeight - 70; // 패들 위에 공을 배치하기 위해 paddleHeight 만큼 위로 올림

    // 패들 초기 위치
    let paddleX = (canvas.width / 2) - (paddleWidth / 2);  
    let paddleY = canvas.height - paddleHeight - 20;

    // 키보드 입력 처리를 위한 변수 초기 설정
    let leftPressed = false;
    let rightPressed = false;

    // 키보드 입력 이벤트 리스너 등록
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    // 클리어 블록
    let clearX = parseInt(blockColumnCount / 2);
    let clearY = parseInt(blockRowCount / 2);

    let score = 0;

    // 랜덤으로 보너스타임 블록 선택                                             // 수정!!
    let specialBlocks = [];
    let prophetAbilityActive = sessionStorage.getItem('prophetAbilityActive') === 'true'; // 예언자맛 쿠키 

    function getRandomBlock(exclude) {                                      // 추가!!
        let block;
        do {
            block = {
                x: Math.floor(Math.random() * blockColumnCount),
                y: Math.floor(Math.random() * blockRowCount)
            };
        } while (exclude.some(b => b.x === block.x && b.y === block.y));
        return block;
    }

    specialBlocks.push(getRandomBlock([{ x: clearX, y: clearY }]));
    if (prophetAbilityActive) {
        specialBlocks.push(getRandomBlock([{ x: clearX, y: clearY }, specialBlocks[0]]));
        specialBlocks.push(getRandomBlock([{ x: clearX, y: clearY }, specialBlocks[0], specialBlocks[1]]));
    }

    // 마카롱맛 쿠키는 3번 맞아야 없어지는 블록 갯수 0개
    let macaroonAbilityActive = sessionStorage.getItem('macaroonAbilityActive') === 'true';

    // 임의의 14개 블록 선택
    let randomBlocks = [];
    while (randomBlocks.length < 14) {
        let randX = Math.floor(Math.random() * blockColumnCount);
        let randY = Math.floor(Math.random() * blockRowCount);
        if (!randomBlocks.some(block => block.x === randX && block.y === randY)) {
            // 각 블록의 초기 값 설정
            let initialHitValue;
            if(macaroonAbilityActive){
                initialHitValue = 1;
            }
            else{
                if (randomBlocks.length < 7) {
                    initialHitValue = 3;
                } else if (randomBlocks.length < 14) {
                    initialHitValue = 2;
                }
            }
            randomBlocks.push({ x: randX, y: randY, initialHitValue: initialHitValue });
        }
    }

    // 블록 배열 생성
    let blocks = [];
    for (let c = 0; c < blockColumnCount; c++) {
        blocks[c] = [];
        for (let r = 0; r < blockRowCount; r++) {
            // 스페셜 블록 여부를 랜덤으로 결정
            let isClear = (c === clearX && r === clearY);
            let isSpecial = specialBlocks.some(b => b.x === c && b.y === r);
            let randomBlock = randomBlocks.find(block => block.x === c && block.y === r);
            let isRandomBlock = !!randomBlock;

            // remainingHits 설정
            let remainingHits;
            if (isSpecial || isClear) {
                remainingHits = 1; // isSpecial 또는 isClear가 true인 경우 1로 설정
            } else {
                remainingHits = randomBlock ? randomBlock.initialHitValue : 1;
            }

            blocks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                isSpecial: isSpecial,
                remainingHits: remainingHits,
                isRandom: isRandomBlock,
                isClear: isClear
            }; // 각 블록의 초기 상태
        }
    }

    // 게임 클리어 여부
    let gameClear = false;

    //악마맛쿠키
    let devilAbilityActive = sessionStorage.getItem('devilAbilityActive') === 'true';
    function deleteBlock(blocks) {
        let deleteBlocks = [];
    
        // // 중간에 있는 블록의 좌표
        // let middleBlockX = 7;
        // let middleBlockY = 2;
    
        while (deleteBlocks.length < 8) {
            let randX = Math.floor(Math.random() * blocks.length);
            let randY = Math.floor(Math.random() * blocks[0].length);
    
            let selectedBlock = blocks[randX][randY];
    
            // 조건에 맞지 않는 블록들을 선택하도록 필터링
            if (
                !selectedBlock.isSpecial && // 특별 블록 제외
                !(randX === clearX && randY === clearY) && // 중간 블록 제외
                !deleteBlocks.some(block => block.x === randX && block.y === randY) // 중복 블록 제외
            ) {
                deleteBlocks.push({ x: randX, y: randY });
            }
        }
    
        // 선택된 블록들을 삭제 (status를 0으로 설정)
        for (let block of deleteBlocks) {
            blocks[block.x][block.y].status = 0;
        }
    }
    
    // 점수 그리기 함수
    function drawScore() {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#0095DD';
        ctx.fillText('Score: ' + score, 8, 20);
    }
    
    // 블록 그리기 함수
    function drawBlocks() {
        if (devilAbilityActive) {
            deleteBlock(blocks); // devilAbilityActive가 true일 때 블록을 삭제
            devilAbilityActive = false; // 블록 삭제 후 devilAbilityActive를 false로 설정
            // sessionStorage.setItem('devilAbilityActive', 'false'); // 세션 저장소에서도 업데이트
        }
    
        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                if (blocks[c][r].status === 1) {
                    let blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
                    let blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
                    blocks[c][r].x = blockX;
                    blocks[c][r].y = blockY;
                    ctx.beginPath();
                    ctx.rect(blockX, blockY, blockWidth, blockHeight);
                    if (c === clearX && r === clearY) {
                        ctx.drawImage(clearBlockImage, blockX, blockY, blockWidth, blockHeight); // 클리어 블록
                    } else if (blocks[c][r].isSpecial) {
                        ctx.drawImage(specialBlockImage, blockX, blockY, blockWidth, blockHeight); // 보너스타임 블록
                    } else if (blocks[c][r].isRandom) {
                        switch (blocks[c][r].remainingHits) {
                            case 3:
                                ctx.drawImage(hit1Image, blockX, blockY, blockWidth, blockHeight); // 랜덤 블록
                                break;
                            case 2:
                                ctx.drawImage(hit2Image, blockX, blockY, blockWidth, blockHeight); // 1번 맞은 블록
                                break;
                            case 1:
                                ctx.drawImage(hit3Image, blockX, blockY, blockWidth, blockHeight); // 2번 맞은 블록
                                break;
                            default:
                                ctx.drawImage(hit3Image, blockX, blockY, blockWidth, blockHeight); // 3번 맞은 블록
                                break;
                        }
                    } else {
                        ctx.drawImage(plainBlockImage, blockX, blockY, blockWidth, blockHeight); // 일반 블록
                    }
                    ctx.closePath();
                }
            }
        }
    }

    //정글전사맛 쿠키 양 옆 블록 같이 삭제
    let jungleAbilityActive = sessionStorage.getItem('jungleAbilityActive') === 'true';

    let bonustimeTime = 10000;
    // 공주맛 쿠키는 보너스 타임 두배
    bonustimeTime = parseFloat(sessionStorage.getItem('bonustimeTime'));

    //삭제 수정 발생
    
    // 공과 블록 간의 충돌 감지
    var bonusgame;
    function collisionDetection() {
        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                let block = blocks[c][r];
                if (block.status === 1) {
                    let blockX = block.x;
                    let blockY = block.y;
                    if (x > blockX && x < blockX + blockWidth && y > blockY && y < blockY + blockHeight) {
                        dy = -dy; // 충돌 시 공의 이동 방향 변경
                        handleBlockHit(block, c, r); // 블록 충돌 처리 함수 호출
    
                        if (jungleAbilityActive) { // 정글전사맛 쿠키 선택 시 양 옆의 블록도 데미지
                            if (c > 0) { // 왼쪽 블록
                                let leftBlock = blocks[c - 1][r];
                                if (leftBlock.status === 1) {
                                    handleBlockHit(leftBlock, c - 1, r);
                                }
                            }
                            if (c < blockColumnCount - 1) { // 오른쪽 블록
                                let rightBlock = blocks[c + 1][r];
                                if (rightBlock.status === 1) {
                                    handleBlockHit(rightBlock, c + 1, r);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    function handleBlockHit(block, c, r) {
        block.remainingHits--; // 충돌 시 값 감소
        if (block.remainingHits <= 0) {
            block.status = 0; // 값이 0이 되면 블록 제거
            score += 10; // 블록이 깨질 때마다 10점 추가
            drawScore(); // 점수를 업데이트하여 화면에 표시
    
            // 만약 클리어 블록을 깼다면 게임 클리어 처리
            if (block.isClear && gameClear === false) {
                gameClear = true;
                //삭제 수정 발생
                clearInterval(gameStart);
                createPopup("level2_step5.html", "10.png");//수정 발생
                //삭제 수정 발생
            }
    
            // 만약 보너스타임 블록을 깼다면 보너스타임 화면을 표시하고, 10초 후에 감추고 공을 5개로 증가시킴
            if (block.isSpecial) {
                document.getElementById('bonustime').style.display = 'block';
                clearInterval(gameStart);
                bonusgame = setInterval(drawBonusGame, 10); // 공을 5개로 증가시킴
                setTimeout(function () {
                    clearInterval(bonusgame);
                    document.getElementById('bonustime').style.display = 'none'; // 10초 후에 숨김
                    if (!gameClear) gameStart = setInterval(drawGame, 10);
                }, bonustimeTime || 10000); // 보너스 타임 시간 설정
            }
        }
    }
    
    let ballRadius = 10;
    ballRadius = parseFloat(sessionStorage.getItem('ballRadius'));

    // 패들 이동 속도
    let paddleSpeed = 5;
    paddleSpeed = parseFloat(sessionStorage.getItem('paddleSpeed'));
    
    
    //보너스 공 5개 만들기
    var balls = [];
    var ballnumber = 3;   
    for(var i =0; i < ballnumber; i++){
        balls.push({
           bonusX : canvas.width / 2,
           bonusY : canvas.height - paddleHeight - 70,
           bonusDx : parseFloat(sessionStorage.getItem('dx')),
           bonusDy : parseFloat(sessionStorage.getItem('dy')) - (i * 0.2),
           bonusBallImage : ballImage,
           bonusballRadius : ballRadius
        });
    }
    var bonuspaddleX = (canvas.width / 2) - (paddleWidth / 2);
    var bonuspaddleY = canvas.height - paddleHeight - 20;

    //공 그리기
    function drawBonusBalls() {
        //보너스 공 5개 그리기
        balls.forEach(function(ball) {
            ctx.drawImage(ball.bonusBallImage, ball.bonusX - ball.bonusballRadius, ball.bonusY - ball.bonusballRadius, ball.bonusballRadius * 2, ball.bonusballRadius * 2);
        });
    }

    //공 이동 + 경계 처리
    function bonusBallsMove() {
        //보너스 공 이동 + 경계 처리
        balls.forEach(function(ball) {
            ball.bonusX += ball.bonusDx;
            ball.bonusY += ball.bonusDy;

            if (ball.bonusX + ball.bonusDx > canvas.width - 30 || ball.bonusX + ball.bonusDx < 10) {ball.bonusDx = -ball.bonusDx;}
            if (ball.bonusY + ball.bonusDy > canvas.height - 10 || ball.bonusY + ball.bonusDy < 10) {ball.bonusDy = -ball.bonusDy;}
           
        });
    }

    //공과 블록간의 충돌 감지
    function bonusCollisionDetection() {
        //보너스 공과 블록간의 충돌 감지
        balls.forEach(function(ball) {
            for (let c = 0; c < blockColumnCount; c++) {
                for (let r = 0; r < blockRowCount; r++) {
                    let block = blocks[c][r];
                    if (block.status === 1) {
                        let blockX = block.x;
                        let blockY = block.y;
                        if (ball.bonusX > blockX && ball.bonusX < blockX + blockWidth && ball.bonusY > blockY && ball.bonusY < blockY + blockHeight) {
                            ball.bonusDy = -ball.bonusDy; // 충돌 시 공의 이동 방향 변경
                            block.remainingHits--;
                            if(block.remainingHits <= 0){ // 충돌한 블록 제거
                                block.status = 0;
                            }
                            // 만약 클리어 블록을 깼다면 게임 클리어 처리
                            if (c === clearX && r === clearY && gameClear === false) {
                                gameClear = true;
                                //삭제 수정 발생
                                clearInterval(bonusgame);
                                clearInterval(gameStart);
                                createPopup("level2_step5.html", "10.png");//수정 발생
                                //삭제 수정 발생
                            }
                        }
                    }
                }
            }
        });
    }

    // 패들과 충돌처리
    function bonusCollisionPaddle() {
        balls.forEach(function(ball) {
            if (ball.bonusY + ball.bonusDy > bonuspaddleY && ball.bonusY + ball.bonusDy < bonuspaddleY + paddleHeight) {
                if (ball.bonusX > bonuspaddleX && ball.bonusX < bonuspaddleX + paddleWidth) {
                    // 패들과의 충돌 위치에 따라 공의 이동 방향을 조정
                    let collisionPoint = ball.bonusX - (bonuspaddleX + paddleWidth / 2);
                    collisionPoint = collisionPoint / (paddleWidth / 2);
                    let angle = collisionPoint * (Math.PI / 3); // 최대 60도 각도로 튕기기

                    // 기존 속도를 가져와서 새로운 속도로 계산
                    let speed = Math.sqrt(ball.bonusDx * ball.bonusDx + ball.bonusDy * ball.bonusDy);
                    ball.bonusDx = speed * Math.sin(angle);
                    ball.bonusDy = -speed * Math.cos(angle); // 공이 위로 튕기도록 Y축 속도를 음수로 설정
                }
            }
        });
    }

    // 패들 그리기 함수
    function drawBonusPaddle() {
        var paddleImg = new Image();
        paddleImg.src = 'paddle.png';
        ctx.drawImage(paddleImg, bonuspaddleX, bonuspaddleY, paddleWidth, paddleHeight);
    }


    // 패들 이동 함수
    function movebonusPaddle() {
        if (rightPressed && bonuspaddleX < canvas.width - paddleWidth) {
            bonuspaddleX += paddleSpeed; // 패들 이동 속도를 증가시킴
        } else if (leftPressed && bonuspaddleX > 0) {
            bonuspaddleX -= paddleSpeed; // 패들 이동 속도를 증가시킴
        }
    }

    // 눈설탕맛 벽 충돌처리
    function snowWallsCollision(){
        balls.forEach(function(ball) {
            if(snowAbilityActive){
                if (ball.bonusY + ball.bonusDy > canvas.height - paddleHeight - 20 -1) {
                    if ((ball.bonusX > wallX1 && ball.bonusX < wallX1 + wallSize) || (ball.bonusX > wallX2 && ball.bonusX < wallX2 + wallSize)) {
                        ball.bonusDy = -ball.bonusDy;
                    }
                }
            }
        });
    }    


    // 공을 5개로 증가시키는 함수 (보너스타임)    
    function drawBonusGame() {
        //초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 패들 그리기
        drawBonusPaddle();

        // 패들 이동
        movebonusPaddle();

        // 블록 그리기
        drawBlocks();

        // 생명 그리기
        drawHearts();

        //공 그리기
        drawBonusBalls();

        //공 이동 + 경계 처리
        bonusBallsMove();

        //공과 블록간의 충돌 감지
        bonusCollisionDetection();

        // 패들과 충돌처리
        bonusCollisionPaddle();

        // 눈설탕맛 선택시 하단 벽 그리기
            drawWalls();

        // 눈설탕맛 벽 충돌처리
            snowWallsCollision();
    }   

    function createPopup(pageUrl, backgroundImageUrl) {
    
        // 새로운 블록 생성
        var popupBlock = $('<div class="popup-block"></div>');
        popupBlock.css({
            position: 'absolute', 
            top: '170px', 
            left: '50%', // 수평 가운데 정렬
            transform: 'translateX(-50%)',
            backgroundImage: 'url(' + backgroundImageUrl + ')', // 배경 이미지 지정
            backgroundSize: 'cover', 
            width: '600px',
            height: '419px',
            border: 'none',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: '9999' // 요소 맨 위에 표시
        });

        // 확인 버튼
        var cbutton = $('<button></button>');
        cbutton.css({ 
            position: 'absolute',
            top: '360px', 
            left: '230px', //화면 보고 수정 필요 
            width: '170px', 
            height: '56.5px', 
            border: 'none',
            transition: 'transform 0.2s ease',
            backgroundColor: 'transparent', 
            backgroundImage: 'url("ok.png")',//수정 발생
            backgroundSize: 'cover' 
        });
        
        cbutton.hover(function() {
            $(this).css('transform', 'scale(1.1)'); 
        }, function() {
            $(this).css('transform', 'scale(1)'); 
        });

        cbutton.click(function() {
            goToPage(pageUrl);
        });

        popupBlock.append(cbutton);

        $('body').append(popupBlock);
    }

    // 생명을 표시하는 함수
    function drawHearts() {
        let heartContainer = document.querySelector('.heart');
        heartContainer.innerHTML = ''; // 이전에 있던 하트를 지우고 다시 그리기 위해 비워줍니다.
        for (let i = 0; i < hearts; i++) {
            let heartImage = document.createElement('img');
            heartImage.src = 'heart.png';
            heartImage.width = '45';
            heartContainer.appendChild(heartImage);
        }
    }

    // 생명이 감소할 때의 처리 함수
    function heartLost() {
        let wolfAbilityActive = sessionStorage.getItem('wolfAbilityActive') === 'true';
        if (wolfAbilityActive && Math.random() < 0.5) {
            // 50% 확률로 생명이 감소하지 않음
            console.log("웨어울프맛 쿠키 능력 발동: 생명이 감소하지 않았습니다.");
            hearts++;
        }

        hearts--; // 생명 감소
        if (hearts === 0) {
            gameOver();
        } else {
            // 게임이 종료되지 않았다면, 공과 패들의 초기 위치로 돌아가기
            x = canvas.width / 2;
            y = canvas.height - paddleHeight - 70;
            dx = parseFloat(sessionStorage.getItem('dx'));
            dy = parseFloat(sessionStorage.getItem('dy')); // 공 속도 초기화
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    // 게임 오버 처리 함수
    function gameOver() {
        // alert("GAME OVER");
        // document.location.reload();
        clearInterval(gameStart);
        //팝업창 개설 -> 게임 오버 OR 게임 클리어 출력 + 아래에 확인 버튼 생성
        //->확인 버튼에서 click 이벤트 발생할 경우 goToPage(~); 실행
        sessionStorage.setItem("gameClear", gameClear);
        createPopup('level2.html', 'gameover.png');
    }

    // 키보드 다운 이벤트 핸들러
    function keyDownHandler(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            rightPressed = true;
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            leftPressed = true;
        }
    }

    // 키보드 업 이벤트 핸들러
    function keyUpHandler(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            rightPressed = false;
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            leftPressed = false;
        }
    }

    
    // 패들 이동 함수
    function movePaddle() {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += paddleSpeed; // 패들 이동 속도를 증가시킴
        } else if (leftPressed && paddleX > 0) {
            paddleX -= paddleSpeed; // 패들 이동 속도를 증가시킴
        }
    }
    
    // 공 이미지 그리기 함수
    function drawBall() {
        ctx.drawImage(ballImage, x - ballRadius, y - ballRadius, ballRadius*2, ballRadius*2); // 이미지 크기는 20x20, 이미지의 중심을 공의 중심으로 설정하기 위해 x-10, y-10
    }

       // 패들 그리기 함수
function drawPaddle() {
    var paddleImg = new Image();
    paddleImg.src = 'paddle.png';
    ctx.drawImage(paddleImg, paddleX, paddleY, paddleWidth, paddleHeight);
}

    // 눈설탕 벽 그리기
    let wallSize = 100;
    let wallX1 = canvas.width * 2 / 7;
    let wallX2 = canvas.width * 5 / 7;
    let wallY = paddleY - 1;
    let snowAbilityActive = sessionStorage.getItem('snowAbilityActive') === 'true';

    // icewall 이미지를 로드
    let icewallImage = new Image();
    icewallImage.src = 'icewall.png';

    // 이미지 로드 완료 핸들러
    icewallImage.onload = function() {
        console.log('Icewall image loaded.');
        drawGame(); // 이미지가 로드된 후 게임을 다시 그리기
    }

    function drawWalls() {
        if (snowAbilityActive) {
            // 벽1
            ctx.drawImage(icewallImage, wallX1, wallY, wallSize, paddleHeight);
            // 벽2
            ctx.drawImage(icewallImage, wallX2, wallY, wallSize, paddleHeight);
        }
    }


    // 게임 그리기 함수
    function drawGame() {
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // 공 그리기
        drawBall();
    
        // 패들 이동
        movePaddle();
    
        // 패들 그리기
        drawPaddle();
    
        // 눈설탕맛 선택시 하단 벽 그리기
        drawWalls();
    
        // 블록 그리기
        drawBlocks();
    
        // 생명 그리기
        drawHearts();
    
        // 점수 그리기
        drawScore();
    
        // 충돌 감지
        collisionDetection();
    
        // 공의 경계처리
        if (x + dx > canvas.width - 10 || x + dx < 10) {
            dx = -dx;
        }
        if (y + dy < 10) {
            dy = -dy;
        }
    
        // 패들과 충돌처리
        if (y + dy > canvas.height - paddleHeight - 20) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
                // 패들과의 충돌 위치에 따라 공의 이동 방향을 조정
                let collisionPoint = x - (paddleX + paddleWidth / 2);
                collisionPoint = collisionPoint / (paddleWidth / 2);
                let angle = collisionPoint * (Math.PI / 3); // 최대 60도 각도로 튕기기
                dx = 2 * parseFloat(sessionStorage.getItem('dx')) * Math.sin(angle);
                dy = 2 * parseFloat(sessionStorage.getItem('dy')) * Math.cos(angle);
            } else {
                heartLost(); // 공이 바닥에 닿으면 생명 감소
            }
        }
    
        // 눈설탕맛 벽 충돌처리
        if(snowAbilityActive){
            if (y + dy > canvas.height - paddleHeight - 20 -1) {
                if ((x > wallX1 && x < wallX1 + wallSize) || (x > wallX2 && x < wallX2 + wallSize)) {
                    dy = -dy;
                }
            }
        }
    
        // 공 이동
        x += dx;
        y += dy;
    }
    
    // 게임 시작
    let gameStart = setInterval(drawGame, 10);

    // 음악!!
    var backgroundMusic = $('#background-music')[0];
    var musicButton = $('#music-button');
    var isMusicPlaying = false;
    var musicButtonImage = $('#music-button img');

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