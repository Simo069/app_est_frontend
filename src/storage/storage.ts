
import type { UserSelection } from "../types";


export const SelectionStorage ={
    save : (selection:UserSelection)=>{
        try{
            localStorage.setItem('est_casa_selection', JSON.stringify(selection));
            sessionStorage.setItem('est_casa_selection', JSON.stringify(selection));
        }catch(error){
            console.error('Erreur de sauvegared :',error);    
        }
    },

    get : () : UserSelection | null => {
        try{
            const selection = localStorage.getItem('est_casa_selection') || sessionStorage.getItem('est_casa_selection');
            if(selection){
                return JSON.parse(selection) as UserSelection;
            }
            const sessionData = sessionStorage.getItem('est_casa_selection');
            return sessionData ? JSON.parse(sessionData) : null;
        }catch(error){
            console.error('Erreur de récupération:', error);
            return null;
        }
    },

    clear : ()=>{
        localStorage.removeItem('est_casa_selection');
        sessionStorage.removeItem('est_casa_selection');
    }

}