const axios = require('axios');
const fs = require('fs');

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


    // Write to file
    fs.writeFileSync("data.json", JSON.stringify(sorted_filtered), 'utf-8');
}

main();