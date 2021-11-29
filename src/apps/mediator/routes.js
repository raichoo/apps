// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import Dashboard from './dashboard';
import LoggedOut from './logged-out';

const routes = new Map([
    [
        'mediatorLoggedOut',
        {
            url: '/mediator/logged-out',
            handler: () => ({
                title: 'logged-out',
                component: LoggedOut,
                isSimple: true,
                props: {},
            }),
        },
    ],
    [
        'mediatorDashboard',
        {
            url:
                '/mediator(?:/(providers|stats|settings)(?:/([a-z0-9-]+))?(?:/([a-z0-9-]+))?(?:/([a-z0-9]+))?)?',
            handler: (tab, action, secondaryAction, id) => ({
                title: 'dashboard',
                component: Dashboard,
                isSimple: true,
                props: {
                    tab: tab || 'providers',
                    action: action,
                    secondaryAction: secondaryAction,
                    id: id,
                },
            }),
        },
    ],
]);

export default routes;
