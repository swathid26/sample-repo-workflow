const axios = require('axios');

const [,,command,workflowType] = process.argv;

async function run(command) {
    if(!command) {
        throw new Error('Command ping or pong required');
    }
    
    let payload = {
        event_type: "",
            client_payload: {
                command: ""
            }
    };
    
    const {
        REPO_OWNER: owner,
        REPO_NAME: repo,
        GITHUB_TOKEN: token,
    } = process.env;

    const isAllInOne = workflowType === "allinone";

    console.log(`Received ${command || "No"} command`);
    switch(command) {
        case "ping":
            payload.event_type = `run-pong${isAllInOne ? '-allinone' : ''}`;
            payload.client_payload.command = "pong";
            break;
        case "pong":
            payload.event_type = `run-done${isAllInOne ? '-allinone' : ''}`;
            payload.client_payload.command = "done";
            break;
        case "done":
            console.log('I GUESS WE ARE DONE!!! :-D');
            return;
        default:
            throw new Error('Command not supported');
    }

    if(!owner || !repo || !token) {
        throw new Error('Owner and repo required');
    }
    
    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
    
    console.log(`Dispatching ${dispatchUrl} with paylaod`, payload);
    const res = await axios.post(dispatchUrl, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json" 
        }
    })
    return res.status;

}
run(command)
.then(() => console.log('Completed running command'))
.catch(e => {
    console.log(e.message);
    process.exit(1);
})