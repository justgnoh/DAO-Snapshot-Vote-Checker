import Chart from 'chart.js/auto'
import annotationPlugin from 'chartjs-plugin-annotation';
import axios from 'axios';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const subgraph = "https://hub.snapshot.org/graphql";

function descVotes(array,key) {
    return array.sort((a,b) => {
        let x = a[key][0];
        let y = b[key][0];
        return(y-x);
    })
}

async function main() {
    const queryProposal = await axios.post(subgraph, {
        query: `
        {
            proposals(
              first: 1000,
              skip: 0,
              where: {
                space_in: ["arbitrumfoundation.eth"],
                state: "active"
              },
              orderBy: "votes",
              orderDirection: desc
            ) {
              id
              title
              choices
              state
              author
              votes
              scores
            }
          }
        `
      })
  
    console.log("Proposals Found: " + queryProposal.data.data.proposals.length);

    const workingData = queryProposal.data;
    
    let filtered = [];
    
    // Only select those with STIP Proposal
    workingData.data.proposals.forEach((e)=> {
        if (e.title.includes("STIP")) {
            filtered.push(e);
        }
    })

    console.log("Filtered Proposals: " + filtered.length);

    // Sorting by highest votes
    let sorted_filtered = descVotes(filtered,"scores");

    console.log(sorted_filtered);

    return sorted_filtered;
}


(async function() {
    Chart.register(annotationPlugin);

    let queryData = await main();

    new Chart(
        document.getElementById('votes'),
        {
            type:'bar',
            data: {
                labels: queryData.map(row => row.title),
                datasets: [
                    {
                        label: 'For',
                        data: queryData.map(row => row.scores[0]),
                        barThickness: 5,
                        categoryPercentage: 0.5,
                        barPercentage: 0.3,
                    },
                    {
                        label: 'Against',
                        data: queryData.map(row => row.scores[1]),
                        barThickness: 5,
                    },
                    {
                        label: 'Abstain',
                        data: queryData.map(row => row.scores[2]),
                        barThickness: 5
                    }
                ]
            },
            options: {
                plugins: {
                    annotation: {
                        annotations: {
                            line: {
                                type: 'line',
                                xMin: 71510000,
                                xMax: 71510000,
                                borderWidth: 2
                            }
                        }
                    },
                },
                indexAxis: 'y',
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            source: queryData,
                            autoSkip: false,
                            color: function(context) {
                                if (context.tick.label.includes("Range Protocol")) {
                                    return 'red'
                                }
                            }
                        },
                    }
                }
            }
        }
    )
})();