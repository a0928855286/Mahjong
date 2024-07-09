document.addEventListener("DOMContentLoaded", function () {
  let hupai = false;
  const inputTiles = [];
  const reminder = document.getElementById('reminder');
  const outputTiles = document.getElementById('output-tiles');
  const inputTilesDisplay = document.getElementById('input-tiles');
  const baseURL = 'https://a0928855286.github.io/Mahjong/';

  liff.init({ liffId: '2005802130-4Axamgd0' })
        .then(() => {
          if (!liff.isLoggedIn()) {
            liff.login();
          } else {
            // 用户已登录，可以获取用户信息或执行其他操作
            liff.getProfile().then(profile => {
              const userId = profile.userId;
              const displayName = profile.displayName;
              console.log(User ID: ${userId}, Display Name: ${displayName});
            });
          }
        })
        .catch((err) => {
          console.error('LIFF 初始化失败', err);
        });

  
  function addTile(tile) {
    if (inputTiles.length >= 17 || inputTiles.filter(t => t === tile).length >= 4) return;
    inputTiles.push(tile);
    inputTiles.sort();
    updateInputDisplay();
  }

  function removeTile(tile) {
    const index = inputTiles.indexOf(tile);
    if (index > -1) {
      inputTiles.splice(index, 1);
      updateInputDisplay();
    }
  }

  function clearInput() {
    inputTiles.length = 0;
    clearOutput();
    updateInputDisplay();
  }

  function clearOutput() {
    outputTiles.innerHTML = "";
    reminder.value = "";
  }

  function calculateResult() {
    clearOutput();
    const condition = inputTiles.length % 3;
    switch (condition) {
      case 0:
        reminder.value = "你相公囉...";
        break;
      case 1:
        const readyHand = getReadyHand(inputTiles);
        if (readyHand.length > 0) {
          reminder.value = "聽這幾張牌:";
          displayTiles(31, readyHand);
        } else {
          reminder.value = "沒聽牌!再接再厲~";
        }
        break;
      case 2:
        if (checker(inputTiles)) {
          reminder.value = "恭喜胡牌啦~~";
        } else {
          processInputTiles();
        }
        break;
    }
  }

  function displayTiles(dpStart, tiles, withSpacing = false) {
    const div = document.createElement('div');
    
    if (withSpacing) {
      outputTiles.classList.add('align-items-start');
      outputTiles.classList.remove('align-items-center');
      const img = document.createElement('img');
      img.src = `${baseURL}assets/images/img${dpStart}.png`;
      img.className = 'tile';
      img.style.marginRight = '10px'; // 添加间隔
      div.appendChild(img);
    } else {
      outputTiles.classList.add('align-items-center');
      outputTiles.classList.remove('align-items-start');
    }
  
    tiles.forEach(tile => {
      const img = document.createElement('img');
      img.src = `${baseURL}assets/images/img${tile}.png`;
      img.className = 'tile';
      div.appendChild(img);
    });
  
    outputTiles.appendChild(div);
  }

  function updateInputDisplay() {
    inputTilesDisplay.innerHTML = "";
    inputTiles.forEach(tile => {
      const img = document.createElement('img');
      img.src = `${baseURL}assets/images/img${tile}.png`;
      img.className = 'tile';
      img.addEventListener('click', () => removeTile(tile));
      inputTilesDisplay.appendChild(img);
    });
  }

  function processInputTiles() {
    let flag = true;
    for (let i = 0; i < inputTiles.length; i++) {
      const calcList = inputTiles.slice();
      calcList.splice(i, 1);
      const readyHand = getReadyHand(calcList);
      if (readyHand.length > 0) {
        displayTiles(inputTiles[i], readyHand, true);
        flag = false;
      }
      const f = inputTiles.filter(t => t === inputTiles[i]).length;
      i += (f - 1);
    }
    if (flag) reminder.value = "沒聽牌!再接再厲~";
  }

  function checker(list) {
    list.sort();
    for (let i = 0; i < list.length; i++) {
      const count = list.filter(t => t === list[i]).length;
      if (count >= 2) {
        const tempList = list.slice();
        tempList.splice(tempList.indexOf(list[i]), 1);
        tempList.splice(tempList.indexOf(list[i]), 1);
        hupai = false;
        judge(tempList);
        if (hupai) return true;
        i += (count - 1);
      }
    }
    return false;
  }

   function judge(list) {
    if (list.length === 0) {
      hupai = true;
      return;
    }
    const currentCard = list[0];
    const count = list.filter(t => t === currentCard).length;
    switch (count) {
      case 3:
        removeThreeCards(list, currentCard);
        break;
      case 1:
      case 2:
      case 4:
        removeSequence(list, currentCard);
        break;
    }
  }

  function removeThreeCards(list, currentCard) {
    const listCopy = list.slice();
    listCopy.splice(listCopy.indexOf(currentCard), 1);
    listCopy.splice(listCopy.indexOf(currentCard), 1);
    listCopy.splice(listCopy.indexOf(currentCard), 1);
    judge(listCopy);
  }

  function removeSequence(list, currentCard) {
    if (list.includes(currentCard + 1) && list.includes(currentCard + 2) && currentCard <= 37) {
      const listCopy = list.slice();
      listCopy.splice(listCopy.indexOf(currentCard), 1);
      listCopy.splice(listCopy.indexOf(currentCard + 1), 1);
      listCopy.splice(listCopy.indexOf(currentCard + 2), 1);
      judge(listCopy);
    }
  }
  
  function getReadyHand(list) {
    const readyHand = [];
    for (let i = 11; i <= 47; i++) {
      if (i % 10 === 0) continue;
  
      const calcList = list.slice();
      calcList.push(i);
      if (checker(calcList)) {
        readyHand.push(i);
      }
    }
    return readyHand;
  }

  document.getElementById('calculate-btn').addEventListener('click', calculateResult);
  document.getElementById('clear-btn').addEventListener('click', clearInput);

  document.querySelectorAll('.tile-buttons').forEach(buttonGroup => {
    const tiles = buttonGroup.getAttribute('data-tiles').split('-').map(Number);
    for (let i = tiles[0]; i <= tiles[1]; i++) {
      const button = document.createElement('button');
      button.className = 'btn btn-outline-primary m-1';
      const img = document.createElement('img');
      img.src = `${baseURL}assets/images/img${i}.png`;
      img.className = 'tile';
      button.appendChild(img);
      button.addEventListener('click', () => addTile(i));
      buttonGroup.appendChild(button);
    }
  });
});
