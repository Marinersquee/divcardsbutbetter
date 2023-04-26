var sortItemListFn = (a, b) => {
    return a.tier - b.tier;
  };

  var TierEnum = {
    ActualGarbage: 4,
    Situational: 3,
    Meh: 2,
    UsefulAF: 1,
    GodTier: 0,
  }
  var getTierEnumString = function (tier) {
    switch (tier) {
      case TierEnum.ActualGarbage: return "Actual Garbage";
      default:
      case TierEnum.Situational: return "Situational";
      case TierEnum.Meh: return "Meh";
      case TierEnum.UsefulAF: return "Useful AF"
      case TierEnum.GodTier: return "GodTier"
    }
  }

  var createTableFromMap = function (map) {
    if (map.items.length === 0) {
      let div = document.createElement('div');
      div.innerText = "This Map is currently off the Atlas."
      return div;
    }
    let table = document.createElement('table');
    {
      let headerRow = table.insertRow();
      headerRow.classList.add('header');
      let nameCol = headerRow.insertCell();
      nameCol.innerText = 'Item Name';
      let stackSizeCol = headerRow.insertCell();
      stackSizeCol.innerText = 'Stack Size';
      let rewardCol = headerRow.insertCell();
      rewardCol.innerText = 'Reward';
      let tierCol = headerRow.insertCell();
      tierCol.innerText = 'Tier';
    }
    for (let i = 0; i < map.items.sort(sortItemListFn).length; i++) {
      let itemRow = table.insertRow();
      let nameCol = itemRow.insertCell();
      nameCol.innerText = map.items[i].name;
      let stackSizeCol = itemRow.insertCell();
      stackSizeCol.innerText = map.items[i].stackSize;
      let rewardCol = itemRow.insertCell();
      if (map.items[i].link == null){
        rewardCol.innerText = map.items[i].reward;
      }
      else {
        let a = document.createElement('a');
        a.href = map.items[i].link;
        a.target = "_blank";
        rewardCol.appendChild(a);
        a.innerText = map.items[i].reward;
       }

      let tierCol = itemRow.insertCell();
      tierCol.innerText = getTierEnumString(map.items[i].tier);
    }

    return table;

  }

  var parseCsvString = function (csv) {
    let currentCsvIndex = 0;
    let table = [];
    let row = [];
    let currentItem = null;
    while (currentCsvIndex < csv.length) {
      let c = csv[currentCsvIndex];
      currentCsvIndex++;

      switch (c) {
        case ' ':
          if (currentItem === null) continue;
          else currentItem += c;
          break;
        case ',':
          if (currentItem !== null) currentItem = currentItem.trim();
          row.push(currentItem);
          currentItem = null;
          break;
        case '\r':
          continue;
        case '\n':
          if (currentItem !== null) currentItem = currentItem.trim();
          row.push(currentItem);
          currentItem = null;
          table.push(row);
          row = [];
          break;
        default:
          if (currentItem === null) currentItem = c;
          else currentItem += c;
          break;
      }
    }
    table.push(row);
    return table;
  };

  // decode mapData from base64 to string
  var csvData = atob(mapData);
  var parsedData = parseCsvString(csvData);

  var data = {
    maps: {},
    cards: {}
  };

  {
    const idxMap = 0;
    const idxCard = 1;
    const idxTier = 4;
    const idxStackSize = 2;
    const idxReward = 3;
    const idxLink = 5;
    for (let i = 1; i < parsedData.length; i++) {
      const row = parsedData[i];
      let mapName = row[idxMap];
      if (data.maps[mapName] === undefined || data.maps[mapName] === null) {
        data.maps[mapName] = {
          name: mapName,
          items: []
        };
      }
      if (row[idxCard] !== null) {
        data.maps[mapName].items.push({
          name: row[idxCard],
          stackSize: parseInt(row[idxStackSize]),
          reward: row[idxReward],
          tier: TierEnum[row[idxTier]],
          link: row[idxLink]
        })
      }
    }

    // loop through parsedData and check the value of the card column
    // if it's not null, add it to the data.cards object
    // if it is null, skip it
    for (let i = 1; i < parsedData.length; i++) {
        const row = parsedData[i];
        if (row[idxCard] !== null) {
            if (data.cards[row[idxCard]] === undefined || data.cards[row[idxCard]] === null) {
                data.cards[row[idxCard]] = {
                name: row[idxCard],
                maps: []
            }
            }
            data.cards[row[idxCard]].maps.push({
                name: row[idxMap],
                stackSize: parseInt(row[idxStackSize]),
                reward: row[idxReward],
                tier: TierEnum[row[idxTier]],
                link: row[idxLink]
            })
        }
    }
  }
