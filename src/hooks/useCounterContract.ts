import { useEffect, useState } from 'react';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, OpenedContract, toNano } from '@ton/core';
import { Counter } from '../contracts/Counter';
import { useTonConnect } from './useTonConnect';
// Address.parse(`EQA-7jZ5usRnBQcVXl9rG2etuLZn9GAJmZ8FjGpCbbTN4OYm`) // replace with your address from tutorial 2 step 8


export function useCounterContract() {
    const client = useTonClient();
    const [val, setVal] = useState<null | string>();
    const { sender } = useTonConnect();

    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

    const counterContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new Counter(
            Address.parse(`EQA-7jZ5usRnBQcVXl9rG2etuLZn9GAJmZ8FjGpCbbTN4OYm`) // replace with your address from tutorial 2 step 8
            //   Address.parse('EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb') // replace with your address from tutorial 2 step 8
        );
        return client.open(contract) as OpenedContract<Counter>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!counterContract) return;
            setVal(null);
            const val = await counterContract.getCounter();
            setVal(val.toString());
            await sleep(1 * 60 * 1000); // sleep 5 seconds and poll value again
            getValue();
        }
        getValue();
    }, [counterContract]);

    return {
        value: val,
        address: counterContract?.address.toString(),
        sendIncrement: () => {
            return counterContract?.sendIncrease(sender, { increaseBy: 1, value: toNano('0.05') });
        },
    };
}
