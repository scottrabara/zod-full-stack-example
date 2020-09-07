import {
  fromGlobalId,
  Table,
  toGlobalId,
  DeserializedGlobalId,
} from '@mono/utils-server';
import { makeError } from '@mono/utils-common';
import * as C from 'io-ts/Codec';
import * as D from 'io-ts/Decoder';
import * as E from 'io-ts/Encoder';
import { pipe } from 'fp-ts/function';
import {
  name,
  lifespan,
  weight,
  lifecycle,
  diet,
  eatenBy,
} from '@mono/validations-common';

const idD = pipe(
  D.string,
  D.parse(id => {
    const res = fromGlobalId(id);
    return res instanceof Error
      ? D.failure(
          res,
          makeError({
            code: 'invalid_id',
            client: true,
            debug: {
              type: res.name,
              data: res.data,
            },
          })
        )
      : D.success(res);
  })
);

const idE: E.Encoder<string, DeserializedGlobalId> = {
  encode: toGlobalId,
};

export const id = C.make(idD, idE);

const foreignKeyD = D.parse<D.TypeOf<typeof idD>, string>(id =>
  D.success(toGlobalId(id))
);

const typedId = (...table: Array<Table>) =>
  pipe(
    id,
    D.parse(id =>
      table.includes(id.table)
        ? D.success(id)
        : D.failure(
            id,
            makeError({
              code: 'invalid_id',
              client: true,
            })
          )
    )
  );

const animalId = typedId(Table.Animal);
const livingThingId = typedId(Table.Animal, Table.Plant);

const LivingThingCommonD = D.type({
  name,
  lifespan,
  weight,
});

const Diet = pipe(diet, D.compose(D.array(pipe(livingThingId, foreignKeyD))));
const EatenBy = pipe(eatenBy, D.compose(D.array(pipe(animalId, foreignKeyD))));

const AnimalInput = pipe(
  LivingThingCommonD,
  D.intersect(
    D.type({
      diet: Diet,
      eatenBy: EatenBy,
    })
  )
);

export const BackendAnimal = LivingThingCommonD;

const PlantInput = pipe(
  LivingThingCommonD,
  D.intersect(D.type({ eatenBy: EatenBy, lifecycle }))
);

export const BackendPlant = pipe(
  LivingThingCommonD,
  D.intersect(D.type({ lifecycle }))
);

export const LivingThingPatchCommon = D.type({
  name,
  lifespan,
  eatenBy: EatenBy,
  weight,
});

export const AnimalPatchInput = pipe(
  LivingThingPatchCommon,
  D.intersect(D.type({ diet: Diet }))
);

export const PlantPatchInput = pipe(
  LivingThingPatchCommon,
  D.intersect(D.type({ lifecycle }))
);

export const LivingThingPatchInput = D.type({
  animal: AnimalInput,
  plant: PlantInput,
});

export const UpdateLivingThingInput = D.type({
  id: livingThingId,
  patch: LivingThingPatchInput,
});

export const UpdateLivingThingArgs = D.type({
  input: UpdateLivingThingInput,
});

export const DeleteLivingThingInput = D.type({
  id: livingThingId,
});

export const DeleteLivingThingArgs = D.type({
  input: DeleteLivingThingInput,
});

export const NodeArgs = D.type({
  id,
});

export const AllLivingThingsInput = D.type({
  page: D.number,
});

export const AllLivingThingsArgs = D.type({
  input: AllLivingThingsInput,
});

export const LivingThingArgs = D.type({
  id: livingThingId,
});

export const LivingThingInput = pipe(
  D.partial({
    animal: AnimalInput,
    plant: PlantInput,
  }),
  D.parse(union => {
    const { plant, animal } = union;
    if (Object.keys(union).length !== 1)
      return D.failure(
        union,
        makeError({ code: 'multiple_values', client: true })
      );

    const val = plant
      ? { __typename: 'Plant' as const, ...plant }
      : animal
      ? { __typename: 'Animal' as const, ...animal }
      : null;

    if (!val)
      return D.failure(union, makeError({ code: 'no_value', client: true }));

    return D.success(val);
  })
);

export const AddLivingThingInput = D.type({
  livingThing: LivingThingInput,
});

export const AddLivingThingArgs = D.type({
  input: AddLivingThingInput,
});
