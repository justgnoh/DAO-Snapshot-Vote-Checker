import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import axios from 'axios';
import annotationPlugin from 'chartjs-plugin-annotation';


const subgraph = "https://hub.snapshot.org/graphql";

function descVotes(array,key) {
    return array.sort((a,b) => {
        let x = a[key][0];
        let y = b[key][0];
        return(y-x);
    })
}

async function main(state) {
    const queryProposal = await axios.post(subgraph, {
        query: `
        {
            proposals(
              first: 1000,
              skip: 0,
              where: {
                space_in: ["arbitrumfoundation.eth"],
                state: "${state}"
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

function Example() {
    const chartRef = useRef(null);
    const [queryData, setQueryData] = useState(null);
    const [proposalState, setProposalState] = useState("closed");
  
    async function filterProposalState(state) {
      setProposalState(state);
    }
  
    useEffect(() => {
      main(proposalState).then((data) => {
        console.log(data);
        setQueryData(data);
  
        const ctx = chartRef.current.getContext("2d");
  
        // Destroy any existing chart
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
          existingChart.destroy();
        }
  
        const myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.map((row) => row.title),
            datasets: [
              {
                label: "For",
                data: data.map((row) => row.scores[0]),
                barThickness: 5,
                categoryPercentage: 0.5,
                barPercentage: 0.3,
              },
              {
                label: "Against",
                data: data.map((row) => row.scores[1]),
                barThickness: 5,
              },
              {
                label: "Abstain",
                data: data.map((row) => row.scores[2]),
                barThickness: 5,
              },
            ],
          },
          options: {
            plugins: {
              annotation: {
                annotations: {
                  line: {
                    type: "line",
                    xMin: 71510000,
                    xMax: 71510000,
                    borderWidth: 2,
                  },
                },
              },
            },
            indexAxis: "y",
            maintainAspectRatio: false,
            scales: {
              y: {
                ticks: {
                  source: data,
                  autoSkip: false,
                  color: function (context) {
                    if (context.tick.label.includes("Range Protocol")) {
                      return "red";
                    }
                  },
                },
              },
            },
          },
        });
  
        return () => {
          myChart.destroy();
        };
      });
    }, [proposalState]);
  
    return (
      <div>
        {/* line chart */}
        <h1 className="w-[110px] mx-auto mt-10 text-xl font-semibold capitalize ">
          DAO Snapshot Checker
        </h1>
        <button onClick={() => filterProposalState("active")}>
          Opened Proposals
        </button>
        <button onClick={() => filterProposalState("closed")}>
          Closed Proposals
        </button>
        <div style={{ width: "100%", height: "140vh" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  }
  
  export default Example;
