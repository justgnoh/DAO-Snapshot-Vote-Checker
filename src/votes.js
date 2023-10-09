import Chart from 'chart.js/auto'
import annotationPlugin from 'chartjs-plugin-annotation';
import queryData from '../data.json'

Chart.register(annotationPlugin);


(async function() {
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