class Letter {
  constructor(letter,value){
    this.letter = letter;
    this.value = value;
  }
}

const btnLoadFile = document.getElementById('btnLoadFile');
const btnResetRules = document.getElementById('btnResetRules');
const fileInput = document.getElementById('file-input');
let rules;
btnResetRules.disabled = true;

btnLoadFile.addEventListener('click',(e) => {
  readFile(e);
});

btnResetRules.addEventListener('click',() =>{
  fileInput.value = '';
  btnLoadFile.disabled = false;
  btnResetRules.disabled = true;
  rules = '';
  document.getElementById('result-area').removeChild(document.getElementById('ruleTable'));
});

const readFile = (e) => {
  if(fileInput.value == ''){
    alert('No file selected');
    return;
  }

  let file = fileInput.files[0];
  let reader = new FileReader();

  reader.addEventListener('loadstart',() => {
    console.log('File is being loading');
  })

  reader.addEventListener('load',(e) =>{
    let valuesTable = csvIntoArrayOfObjects(e.target.result);
    buildRules(valuesTable);
  });

  reader.addEventListener('error',() =>{
    console.log(`An error has ocurred: ${reader.error.code}`);
    alert("Error to load the file");
  });

  reader.readAsText(file);
  btnLoadFile.disabled = true;
  btnResetRules.disabled = false;
}

const buildRules = (values) => {
  rules = values;

  printActualRules();
}

const csvIntoArrayOfObjects = (file) => {
  let letter, value, i = 0;
  let objects = [];

  //Getting individual rows
  file.split('\r\n').map(row => {

    //Getting individual columns
    row.split(';').map(column => {
      i++ % 2 == 0 ? letter = column : value = column;
    });

    objects.push(new Letter(letter,Number(value)));

  });

  return objects;
}

const printActualRules = () => {
  let node = document.getElementById('result-area');
  let arrayOfRows = [];
  let numberOfLetterPerRow = 14;
  let numberOfRows = Math.ceil(rules.length/numberOfLetterPerRow);
  let htmlCode = '';

  for(let i=0;i<numberOfRows;i++){
    arrayOfRows.push(rules.slice(i*numberOfLetterPerRow,(i+1)*numberOfLetterPerRow));
  }

  for(let row of arrayOfRows){
    htmlCode += `<tr>`;
    for(let letter of row){
        htmlCode += `<td>${letter.letter}</td>`
    }
    htmlCode += `</tr>`;
    htmlCode += `<tr>`;
    for(let letter of row){
        htmlCode += `<td>${letter.value}</td>`
    }
    htmlCode += `</tr>`;
  }

  node.innerHTML += `
   <table id="ruleTable" class="table">
     <tbody>
       ${htmlCode}
     </tbody>
   </table>`;
}

//*************************************************************
const btnStart = document.getElementById('btnStart');
const resultArea = document.getElementById('result-area');

btnStart.addEventListener('click',() => {
  let text = document.getElementById('txtInput');
  resetTable('result-table-text');
  resetTable('result-table-values');
  printTableOfGematriaTotal(text.value);
});

const getGematriaOfAChar = (c) => {
  let result = rules.find((letterObject) => {return letterObject.letter == c;});

  return result? result.value : 0;
}

const getGematriaOfAWord = (word) => {
  let total = 0;

  for(let c of word)
    total+= getGematriaOfAChar(c);

  return total;
}

const getReducedGematria = (gematria) => {
  let sum = 0;

  while(gematria){
    sum += gematria % 10;
    gematria = Math.floor(gematria / 10);
  }

  if(sum - 9 > 0){
    return getReducedGematria(sum);
  }

  return sum;
};

const insertRowInTable = (table,arrayOfValues) => {
  let r = table.insertRow(-1);

  for(let i=0;i<arrayOfValues.length;i++){
    r.insertCell(i).innerHTML = arrayOfValues[i];
  }
}

const printTableOfGematriaTotal = (text) => {
  let resultTableText = document.getElementById('result-table-text');
  let resultTableValues = document.getElementById('result-table-values');
  let hebrewText = document.getElementById('isHebrew').checked;
  let arrayOfWords = [];
  let arrayOfGematria = [];
  let arrayOfTotalGematria = [];
  let headers = ['TOTAL','REDUCED'];

  text.split('\n').map((row) =>{
    //THIS ARRAY IS SPLIT INTO WORDS AND INVERTED DUE TO HEBREW LECTURE
    arrayOfWords = row.split(' ');
    if(hebrewText){
      arrayOfWords.reverse();
    }
    //INSERTING TEXT IN A NEW ROW
    insertRowInTable(resultTableText,arrayOfWords);
    //GETTING ARRAY OF GEMATRIA VALUES
    for(let word of arrayOfWords){
      arrayOfGematria.push(getGematriaOfAWord(word));
    }
    //INSERTING VALUES OF GEMATRIA IN A NEW ROW
    insertRowInTable(resultTableText,arrayOfGematria);
    //INSERTING HEADERS
    insertRowInTable(resultTableValues,headers);
    //GETTING TOTAL GEMATRIA
    let totalG = getGematriaOfARow(arrayOfGematria);
    arrayOfTotalGematria.push(totalG);
    arrayOfTotalGematria.push(getReducedGematria(totalG));
    //INSERTING TOTAL SUM IN NEW TABLE AND ROW
    insertRowInTable(resultTableValues,arrayOfTotalGematria);

      //RESSETING ARRAYS
    arrayOfGematria = [];
    arrayOfTotalGematria = [];
  });
}

const getGematriaOfARow = (arrayOfValues) => {
  let total = 0;

  for(let v of arrayOfValues){
    total += v;
  }

  return total;
}

const resetTable = (tableId) => {
  let table = document.getElementById(tableId);
  let rowsNumber = table.rows.length;

  while(rowsNumber--){
    table.deleteRow(0);
  }
}
