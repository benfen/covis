// https://gist.github.com/calebgrove/c285a9510948b633aa47
const stateAbbreviations = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AS': 'American Samoa',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'AA': 'Armed Forces Americas',
  'AE': 'Armed Forces Europe',
  'AP': 'Armed Forces Pacific',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'DC': 'District Of Columbia',
  'FL': 'Florida',
  'GA': 'Georgia',
  'GU': 'Guam',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MH': 'Marshall Islands',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'NP': 'Northern Mariana Islands',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'PR': 'Puerto Rico',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'VI': 'US Virgin Islands',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
};

let cachedNationalData;
let cachedStateData;
const parsedStateData = {};

function getNationalCovidData() {
  if (cachedNationalData) {
    return new Promise((resolve) => {
      resolve(cachedNationalData);
    })
  }

  return fetch('https://covidtracking.com/api/us/daily')
    .then(response => response.json())
    .then((data) => {
      cachedNationalData = data;
      return data;
    });
}

function getStateCovidData() {
  if (cachedStateData) {
    return new Promise((resolve) => {
      resolve(cachedStateData);
    })
  }

  return fetch('https://covidtracking.com/api/states/daily')
    .then(response => response.json())
    .then((data) => {
      cachedStateData = data;
      return data;
    });
}

window.onload = function () {

  const useLogarithmicRef = document.getElementById('use-logarithmic');
  const useAnimationsRef = document.getElementById('use-animations');
  const displayPositiveRef = document.getElementById('display-positive');
  const displayNegativeRef = document.getElementById('display-negative');
  const displayPendingRef = document.getElementById('display-pending');
  const displayHospitalizedRef = document.getElementById('display-hospitalized');
  const displayDeathsRef = document.getElementById('display-deaths');

  useLogarithmicRef.addEventListener('click', createChart);

  displayPositiveRef.addEventListener('click', createChart);

  displayNegativeRef.addEventListener('click', createChart);

  displayPendingRef.addEventListener('click', createChart);

  displayHospitalizedRef.addEventListener('click', createChart);

  displayDeathsRef.addEventListener('click', createChart);


  const useNationalRef = document.getElementById('use-national');
  const useStateRef = document.getElementById('use-state');
  const stateSelectRef = document.getElementById('state-select');

  useNationalRef.addEventListener('click', () => {
    stateSelectRef.disabled = !useStateRef.checked;
    createChart();
  });

  useStateRef.addEventListener('click', () => {
    stateSelectRef.disabled = !useStateRef.checked;
    createChart();
  });

  stateSelectRef.addEventListener('change', createChart);

  function formatData(dataPoints, name) {
    return {
      type: 'line',
      showInLegend: true,
      name,
      dataPoints,
    };
  }

  function convertToDate(timeStamp) {
    const timeString = timeStamp.toString();

    const year = parseInt(timeString.substring(0, 4));
    const month = parseInt(timeString.substring(4, 6)) - 1;
    const day = parseInt(timeString.substring(6, 8));

    return new Date(year, month, day);
  }

  function renderChart(data) {
    const chart = new CanvasJS.Chart('chartContainer', {
      animationEnabled: useAnimationsRef.checked,
      zoomEnabled: true,
      title: {
        text: 'USA COVID-19 Stats'
      },
      axisX: {
        title: 'Date',
        valueFormatString: 'DD MMM',
        interval: 4
      },
      axisY: {
        logarithmic: useLogarithmicRef.checked,
        title: 'COVID Cases',
        titleFontColor: '#6D78AD',
        lineColor: '#6D78AD',
        gridThickness: 0,
        lineThickness: 1,
        includeZero: false,
      },
      legend: {
        verticalAlign: 'top',
        fontSize: 16,
        dockInsidePlotArea: true
      },
      data,
    });

    chart.render();
  }

  function createChart() {
    const promises = [];

    if (useNationalRef.checked) {
      promises.push(getNationalCovidData().then((nationalCovidData) => {
        const positiveCases = [],
          negativeCases = [],
          pendingCases = [],
          hospitalizedCases = [],
          deaths = [];

        nationalCovidData.forEach((datum) => {
          positiveCases.push({ x: convertToDate(datum.date), y: datum.positive });
          negativeCases.push({ x: convertToDate(datum.date), y: datum.negative });
          pendingCases.push({ x: convertToDate(datum.date), y: datum.pending });
          hospitalizedCases.push({ x: convertToDate(datum.date), y: datum.hospitalized });
          deaths.push({ x: convertToDate(datum.date), y: datum.death });
        });

        const data = [];

        if (displayPositiveRef.checked) {
          data.push(formatData(positiveCases, 'US Positive'));
        }

        if (displayNegativeRef.checked) {
          data.push(formatData(negativeCases, 'US Negative'));
        }

        if (displayPendingRef.checked) {
          data.push(formatData(pendingCases, 'US Pending'));
        }

        if (displayHospitalizedRef.checked) {
          data.push(formatData(hospitalizedCases, 'US Hospitalizations'));
        }

        if (displayDeathsRef.checked) {
          data.push(formatData(deaths, 'US Deaths'));
        }

        return data;

      }));
    }
    
    if (useStateRef.checked) {
      promises.push(getStateCovidData().then(() => {
        const stateList = [];
        for (let i = 0; i < stateSelectRef.options.length; i++) {
          if (stateSelectRef.options[i].selected) {
            stateList.push(stateSelectRef.options[i].value);
          }
        }

        const data = [];

        stateList.forEach((state) => {
          const datum = parsedStateData[state];
          if (displayPositiveRef.checked) {
            data.push(formatData(datum.positiveCases, `${state} Positive`));
          }
  
          if (displayNegativeRef.checked) {
            data.push(formatData(datum.negativeCases, `${state} Negative`));
          }
  
          if (displayPendingRef.checked) {
            data.push(formatData(datum.pendingCases, `${state} Pending`));
          }
  
          if (displayHospitalizedRef.checked) {
            data.push(formatData(datum.hospitalizedCases, `${state} Hospitalizations`));
          }
  
          if (displayDeathsRef.checked) {
            data.push(formatData(datum.deaths, `${state} Deaths`));
          }
        });

        return data;

      }));

    }

    Promise.all(promises).then((values) => {
      let data = [];
      values.forEach((value) => {
        data = data.concat(value);
      });

      renderChart(data);
    })
  }

  getStateCovidData().then((stateData) => {
    stateData.forEach((item) => {

      if (parsedStateData[item.state]) {
        const state = parsedStateData[item.state];
        state.positiveCases.push({ x: convertToDate(item.date), y: item.positive });
        state.negativeCases.push({ x: convertToDate(item.date), y: item.negative });
        state.pendingCases.push({ x: convertToDate(item.date), y: item.pending });
        state.hospitalizedCases.push({ x: convertToDate(item.date), y: item.hospitalized });
        state.deaths.push({ x: convertToDate(item.date), y: item.death });

      } else {
        parsedStateData[item.state] = {
          positiveCases: [{ x: convertToDate(item.date), y: item.positive }],
          negativeCases: [{ x: convertToDate(item.date), y: item.negative }],
          pendingCases: [{ x: convertToDate(item.date), y: item.pending }],
          hospitalizedCases: [{ x: convertToDate(item.date), y: item.hospitalized }],
          deaths: [{ x: convertToDate(item.date), y: item.death }],
        };
      }
    });

    Object.keys(parsedStateData).sort().forEach((stateName) => {
      const newOption = document.createElement('option');
      newOption.value = stateName;
      if (stateAbbreviations[stateName]) {
        newOption.textContent = stateAbbreviations[stateName];
      } else {
        newOption.textContent = stateName;
      }
      stateSelectRef.appendChild(newOption);
    });
  });

  createChart();

}