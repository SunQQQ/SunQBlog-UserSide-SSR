import exp from "constants";
import {createApp} from "./main.js";
export default context => {
    return new Promise((resolve,reject)=>{
        const {app,router} = createApp();
        router.push(context.url);
        router.onReady(()=>{
            const matchs = router.getMatchedComponents();
            if(!matchs){
                return reject({code: 404});
            }
            resolve(app);
        },reject);
    });
}