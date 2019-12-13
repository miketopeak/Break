import ITransaction from "./model";
import {ADD_TRANSACTION, RESET_TRANSACTIONS, SET_INFO} from "../../actions/types";

const initState: ITransaction.ModelState = {
    transactions: [],
    countCompletedTransactions: 0,
    averageTransactionsTime: 0,
};

const transactionReducer = (state = initState, action: any) => {

    switch (action.type) {
        case ADD_TRANSACTION: {
            const newTransaction: ITransaction.Model = {
                id: 'transaction' + state.transactions.length,
                status: 'default',
                info: {
                    signature: '',
                    confirmationTime: 0,
                    lamportsCount: 0
                }
            };

            return {
                ...state,
                transactions: [
                    ...state.transactions,
                    newTransaction
                ]
            }
        }
        case SET_INFO: {
            const {id, status, info} = action.payload;

            const newTransactions: ITransaction.Model[] = state.transactions.map((item: ITransaction.Model) => {
                if (item.id === id) {
                    return {
                        ...item,
                        status,
                        info
                    }
                }
                return item;
            });

            const newCountCompletedTransactions = state.countCompletedTransactions + 1;

            const timeSum = newTransactions.reduce((prev: number, elem: ITransaction.Model) => {
                return prev + elem.info.confirmationTime
            }, 0);

            const newAverageTransactionsTime = Number((timeSum / newCountCompletedTransactions).toFixed(3));

            return {
                ...state,
                transactions: newTransactions,
                countCompletedTransactions: newCountCompletedTransactions,
                averageTransactionsTime: newAverageTransactionsTime
            }
        }
        case RESET_TRANSACTIONS: {
            return {
                transactions: [],
                countCompletedTransactions: 0,
                averageTransactionsTime: 0
            }
        }
        default:
            return state;
    }
};

export default transactionReducer;