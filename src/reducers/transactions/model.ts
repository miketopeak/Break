import {Maybe} from "../../toolbox/custom-types";

namespace ITransaction {
    export interface Model {
        id: string
        status: string
        info: TransactionInfo
    }

    export interface TransactionInfo {
        signature: string
        confirmationTime: number
    }

    export interface ModelState {
        transactions: Model[],
        countCompletedTransactions: number
    }
}

export default ITransaction;