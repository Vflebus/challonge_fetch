const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors =  require('cors');


const api =  axios.create({
    baseURL: 'https://api.challonge.com/v1/'
})

const app = express();
const port = 1213;

app.use(cors({
    origin: '*'
}))

app.listen(port, () => console.log(`listenning to port ${port}`));

app.get("/", async (request, response) => {
    const participants = await fetch_challonge('CPUS4W9')
    response.json(participants);
})

const fetch_challonge = async (tournoi) => {
    const participantsData = await api.get(`/tournaments/${tournoi}/participants.json?api_key=HgoEi7lekbPyhvOqFeSki4yurW7dpN5LF4Wqk0hb`);
    const allParticipants = participantsData.data;
    const matchsData = await api.get(`/tournaments/${tournoi}/matches.json?api_key=HgoEi7lekbPyhvOqFeSki4yurW7dpN5LF4Wqk0hb`);
    const allMatchs = matchsData.data;

    const participants = allParticipants.map(participant => {
        const matchsData = allMatchs.filter(match => {
            return (match.match.player1_id == participant.participant.id || match.match.player2_id == participant.participant.id);
        })
        const matchs = matchsData.map(match => {
            const newMatch = {
                round: match.match.round > 0 ? `Winner round ${Math.abs(match.match.round)}` : `Loser round ${Math.abs(match.match.round)}`,
                player1: allParticipants.filter(participant => participant.participant.id == match.match.player1_id)[0].participant.display_name,
                player2: allParticipants.filter(participant => participant.participant.id == match.match.player2_id)[0].participant.display_name,
                winner: allParticipants.filter(participant => participant.participant.id == match.match.winner_id)[0].participant.display_name,
                score: match.match.scores_csv
            };
           return newMatch
        })
        return {
            nom: participant.participant.display_name,
            seed: participant.participant.seed,
            classement_final: participant.participant.final_rank ? participant.participant.final_rank : "Tournoi non complété",
            matchs: matchs
        };
    });
    return participants;
}