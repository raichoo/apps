import React from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Toggle } from '../components/Toggle';
import { Field } from '../components/Field';
import { Form } from '../components/Form';
import Card from '../components/Card';

const distances = { '5km': 5, '10km': 10, '20km': 20, '30km': 30, '40km': 40, '50km': 50 };
const plzRegex = /^[0-9]{5}$/;

type FormSubmitData = {
    code: string;
    plz: string;
    distance: string;
    accessible: boolean;
};

const UserWizard = () => {
    const handleSubmit = async (data: FormSubmitData) => {
        // const res = await setUserTemporaryQueueData({ accessible, distance, zipCode });
        console.log({ data });
    };

    return (
        <div className="container mx-auto min-h-screen 2xl:pt-24 py-12 2xl:w-1/4 lg:w-1/2">
            <Card className="lg:rounded-lg">
                <h1 className="text-4xl text-brand-user">Willkommen</h1>
                <p>Hier kannst Du Dich mit wenigen Angaben für freie Impftermine in Deiner Nähe registrieren.</p>
                <Form onSubmit={handleSubmit}>
                    <div className="py-5">
                        <div className="space-y-4">
                            <Field label="Postleitzahl deines Wohnorts" name="plz" pattern={plzRegex} isRequired>
                                <Input placeholder="38259" />
                            </Field>
                            <Field
                                label="E-Mail-Adresse"
                                name="email"
                                hint="Wenn Du die E-Mail-Adresse ändern willst, an die wir Dir Benachrichtigungen schicken, kannst Du das hier tun."
                                isRequired
                            >
                                <Input placeholder="max.muster@muster.de" />
                            </Field>

                            <Field
                                label="Zugangscode aus deiner E-Mail"
                                name="code"
                                hint="Der in Deiner Anmelde-E-Mail enthaltene Zugangscode (dieser sollte bereits ausgefüllt sein)."
                                isRequired
                            >
                                <Input placeholder="fb892bcc42124679dd4e2aeb935b1c99" />
                            </Field>

                            <Field
                                label="Maximale Entfernung zum Impfort in Kilometern (km)"
                                name="distance"
                                isRequired
                            >
                                <Select values={Object.keys(distances)} placeholder="Bitte wählen..." />
                            </Field>
                            <Field label="Barrierefreier Impfort gewünscht" labelHidden name="accessible">
                                <Toggle label="Barrierefreier Impfort gewünscht" />
                            </Field>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button scheme="user" type="submit">
                            Postleitzahl prüfen
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default UserWizard;
