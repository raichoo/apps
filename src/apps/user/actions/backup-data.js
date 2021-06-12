// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { exportLocalStorageToSecret } from '../../../../kiebitz/user/backup';

export const backupKeys = ['tokenData', 'invitation', 'invitation::verified', 'invitation::accepted', 'secret'];

// make sure the signing and encryption key pairs exist
export async function backupData(state, keyStore, settings, secret) {
    try {
        const [referenceData, data] = exportLocalStorageToSecret(secret, backupKeys);

        // TODO: Fix type coercion or add eslint ignore + comment if on purpose.
        if (state !== undefined && state.referenceData != undefined) {
            if (JSON.stringify(state.referenceData) === JSON.stringify(referenceData)) {
                return state;
            }
        }

        return {
            status: 'succeeded',
            referenceData,
            data,
        };
    } catch (error) {
        console.error(error);
        return {
            status: 'failed',
            error,
        };
    }
}

backupData.actionName = 'backupData';
