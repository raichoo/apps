// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, Fragment as F } from 'react';
import Form from 'helpers/form';
import {
    withRouter,
    withSettings,
    withForm,
    withActions,
    WithLoader,
    withTimer,
    Modal,
    Label,
    DropdownMenu,
    DropdownMenuItem,
    Form as FormComponent,
    FieldSet,
    Icon,
    RetractingLabelInput,
    ErrorFor,
    T,
    CardFooter,
    CardContent,
    Button,
} from 'components';
import { queues, keys, keyPairs, verifiedProviderData } from './actions';
import t from './translations.yml';
import './schedule.scss';

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

const AppointmentsOverview = ({ open, accepted, ...props }) => {
    const acceptedItems = accepted
        .filter(ai => ai.data !== null)
        .map(ai => <li key={ai.invitation.id}>{ai.data.userData.name}</li>);
    return (
        <Modal {...props} title={<T t={t} k="appointments-overview.title" />}>
            <ul>{acceptedItems}</ul>
        </Modal>
    );
};

const CalendarAppointments = ({ open, accepted }) => {
    const [showModal, setShowModal] = useState(false);
    let modal;
    const close = () => setShowModal(false);
    if (showModal)
        modal = (
            <AppointmentsOverview
                onCancel={close}
                onClose={close}
                open={open}
                accepted={accepted}
            />
        );
    return (
        <F>
            {modal}
            <div
                className="kip-appointments"
                onClick={() => setShowModal(true)}
            >
                {open.length} - {accepted.length}
            </div>
        </F>
    );
};

const HourRow = ({ appointments, date, day, hour }) => {
    const ota = new Date(
        date.toLocaleDateString() +
            ' ' +
            hour.toLocaleString('en-US', { minimumIntegerDigits: 2 }) +
            ':00:00'
    );
    const ote = new Date(ota);
    ote.addHours(1);
    const openAppointments = [];
    const acceptedAppointments = [];
    for (const [target, app, inner] of [
        [openAppointments, appointments.open, false],
        [acceptedAppointments, appointments.accepted, true],
    ]) {
        for (const oa of app) {
            let oad;
            if (inner) oad = new Date(oa.invitation.date);
            else oad = new Date(oa.date);
            if (ota <= oad && ote >= oad) target.push(oa);
        }
    }
    let hasAppointments = false;
    if (openAppointments.length > 0 || acceptedAppointments.length > 0)
        hasAppointments = true;
    return (
        <div
            className={
                'kip-hour-row' +
                (hasAppointments ? ' kip-has-appointments' : '')
            }
        >
            {hasAppointments && (
                <CalendarAppointments
                    open={openAppointments}
                    accepted={acceptedAppointments}
                />
            )}
        </div>
    );
};

const HourLabelRow = ({ hour }) => {
    let content;
    if (hour !== '-')
        content = (
            <F>
                {hour.toLocaleString('en-US', { minimumIntegerDigits: 2 })} -{' '}
                {(hour + 1).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                })}
            </F>
        );
    return <div className="kip-hour-row kip-is-hour-label">{content}</div>;
};

const DayLabelRow = ({ day, date }) => {
    return (
        <div className="kip-hour-row kip-is-day-label">
            <span className="kip-day">
                <T t={t} k={`day-${day + 1}`} />
            </span>
            <span className="kip-date">{date.toLocaleDateString()}</span>
        </div>
    );
};

const DayColumn = ({ day, date, appointments }) => {
    const hourRows = [
        <DayLabelRow
            appointments={appointments}
            date={date}
            day={day}
            key="-"
        />,
    ];
    for (let i = 0; i < 24; i++) {
        hourRows.push(
            <HourRow
                appointments={appointments}
                key={i}
                hour={i}
                day={day}
                date={date}
            />
        );
    }
    return <div className="kip-day-column">{hourRows}</div>;
};

const DayLabelColumn = () => {
    const hourRows = [<HourLabelRow hour="-" key="-" />];
    for (let i = 0; i < 24; i++) {
        hourRows.push(<HourLabelRow hour={i} key={i} />);
    }
    return <div className="kip-day-column kip-is-day-label">{hourRows}</div>;
};

const WeekCalendar = ({ startDate, appointments }) => {
    const dayColumns = [<DayLabelColumn key="-" appointments={appointments} />];
    const date = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        dayColumns.push(
            <DayColumn
                appointments={appointments}
                date={new Date(date)}
                day={i}
                key={i}
            />
        );
        date.setDate(date.getDate() + 1);
    }
    return <div className="kip-week-calendar">{dayColumns}</div>;
};

class AppointmentForm extends Form {
    validate() {
        const errors = {};
        if (this.data.date === undefined)
            errors.date = this.settings.t(
                t,
                'new-appointment.please-enter-date'
            );
        if (this.data.time === undefined)
            errors.time = this.settings.t(
                t,
                'new-appointment.please-enter-time'
            );
        return errors;
    }
}

const NewAppointment = withRouter(
    withForm(
        ({ router, form: { valid, error, data, set, reset } }) => {
            const cancel = () => router.navigateToUrl('/provider/schedule');
            const save = () => router.navigateToUrl('/provider/schedule');
            return (
                <Modal
                    saveDisabled={!valid}
                    className="kip-new-appointment"
                    onSave={save}
                    onCancel={cancel}
                    onClose={cancel}
                    title={<T t={t} k="new-appointment.title" />}
                >
                    <FormComponent>
                        <FieldSet>
                            <div className="field">
                                <Label htmlFor="date">
                                    <T t={t} k="new-appointment.date" />
                                </Label>
                                <ErrorFor error={error} field="date" />
                                <input
                                    value={data.date || ''}
                                    type="date"
                                    onChange={e => set('date', e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <Label htmlFor="time">
                                    <T t={t} k="new-appointment.time" />
                                </Label>
                                <ErrorFor error={error} field="time" />
                                <input
                                    type="time"
                                    value={data.time || ''}
                                    onChange={e => set('time', e.target.value)}
                                    step={60}
                                />
                            </div>
                        </FieldSet>
                    </FormComponent>
                </Modal>
            );
        },
        AppointmentForm,
        'form'
    )
);

// https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

const Invitations = withTimer(
    withSettings(
        withRouter(
            withActions(
                ({
                    action,
                    id,
                    keys,
                    keysAction,
                    keyPairs,
                    timer,
                    settings,
                    keyPairsAction,
                    verifiedProviderData,
                    verifiedProviderDataAction,
                    invitationQueues,
                    invitationQueuesAction,
                    router,
                }) => {
                    const [initialized, setInitialized] = useState(false);

                    const backend = settings.get('backend');
                    const acceptedAppointments = backend.local.get(
                        'provider::appointments::accepted',
                        []
                    );
                    const openAppointments = backend.local.get(
                        'provider::appointments::open',
                        []
                    );

                    useEffect(() => {
                        if (initialized) return;
                        setInitialized(true);
                        // we load all the necessary data
                        verifiedProviderDataAction().then(pd => {
                            if (pd.data === null) return;
                            invitationQueuesAction(
                                pd.data.signedData.json.queues
                            );
                        });
                        keyPairsAction();
                        keysAction();
                    });

                    let newAppointmentModal;

                    if (action === 'new-appointment')
                        newAppointmentModal = <NewAppointment />;

                    const startDate = getMonday(new Date());

                    const render = () => {
                        return (
                            <div>
                                {newAppointmentModal}
                                <DropdownMenu
                                    title={
                                        <F>
                                            <Icon icon="calendar" />{' '}
                                            Kalenderansicht
                                        </F>
                                    }
                                >
                                    <DropdownMenuItem
                                        icon="calendar"
                                        onClick={() => console.log('foo')}
                                    >
                                        Kalenderansicht
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        icon="list"
                                        onClick={() => console.log('foo')}
                                    >
                                        Listenansicht
                                    </DropdownMenuItem>
                                </DropdownMenu>
                                <DropdownMenu
                                    title={
                                        <F>
                                            <Icon icon="calendar-plus" />
                                        </F>
                                    }
                                >
                                    <DropdownMenuItem
                                        icon="clock"
                                        onClick={() =>
                                            router.navigateToUrl(
                                                '/provider/schedule/new-appointment'
                                            )
                                        }
                                    >
                                        Einzeltermin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        icon="list"
                                        onClick={() => console.log('foo')}
                                    >
                                        Terminserie
                                    </DropdownMenuItem>
                                </DropdownMenu>
                                <WeekCalendar
                                    startDate={startDate}
                                    appointments={{
                                        open: openAppointments,
                                        accepted: acceptedAppointments,
                                    }}
                                />
                            </div>
                        );
                    };

                    // we wait until all resources have been loaded before we display the form
                    return (
                        <WithLoader
                            resources={[
                                keys,
                                keyPairs,
                                invitationQueues,
                                verifiedProviderData,
                            ]}
                            renderLoaded={render}
                        />
                    );
                },
                new Map([
                    [verifiedProviderData],
                    [queues, 'invitationQueues'],
                    [keys],
                    [keyPairs],
                ])
            )
        )
    ),
    2000
);

export default Invitations;
