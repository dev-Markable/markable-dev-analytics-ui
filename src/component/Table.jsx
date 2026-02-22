import React from "react";
import { useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';

//nested data is ok, see accessorKeys in ColumnDef below
const data = [
    {
        "email": "evgeny.kungurov@x5.ru",
        "mergeCommits": 0,
        "commits": 2,
        "added": 36,
        "deleted": 3,
        "testAdded": 0
    },
    {
        "email": "a.olkhovatova@x5.ru",
        "mergeCommits": 0,
        "commits": 64,
        "added": 7625,
        "deleted": 1870,
        "testAdded": 5833
    },
    {
        "email": "roman.lukyanov@x5.ru",
        "mergeCommits": 0,
        "commits": 2,
        "added": 2,
        "deleted": 2,
        "testAdded": 0
    },
    {
        "email": "kirill.trifonov@x5.ru",
        "mergeCommits": 1,
        "commits": 45,
        "added": 7252,
        "deleted": 3697,
        "testAdded": 522
    },
    {
        "email": "ily.galochkin@x5.ru",
        "mergeCommits": 0,
        "commits": 25,
        "added": 1734,
        "deleted": 109,
        "testAdded": 807
    },
    {
        "email": "gitlabgk@x5.ru",
        "mergeCommits": 1,
        "commits": 130,
        "added": 1398,
        "deleted": 1376,
        "testAdded": 0
    },
    {
        "email": "makszhukov@x5.ru",
        "mergeCommits": 24,
        "commits": 87,
        "added": 663,
        "deleted": 224,
        "testAdded": 0
    },
    {
        "email": "darya.rusheva@x5.ru",
        "mergeCommits": 0,
        "commits": 31,
        "added": 8192,
        "deleted": 580,
        "testAdded": 7593
    },
    {
        "email": "alexey.grishchenko@x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 0,
        "deleted": 492,
        "testAdded": 0
    },
    {
        "email": "mikha.kolesnikov@x5.ru",
        "mergeCommits": 1,
        "commits": 36,
        "added": 2537,
        "deleted": 828,
        "testAdded": 338
    },
    {
        "email": "vikto.zhigunov@x5.ru",
        "mergeCommits": 0,
        "commits": 37,
        "added": 3135,
        "deleted": 310,
        "testAdded": 1493
    },
    {
        "email": "vladisla.gritsev@x5.ru",
        "mergeCommits": 0,
        "commits": 88,
        "added": 21099,
        "deleted": 12286,
        "testAdded": 15849
    },
    {
        "email": "vladimir.lyamkin@x5.ru",
        "mergeCommits": 0,
        "commits": 6,
        "added": 6,
        "deleted": 4,
        "testAdded": 0
    },
    {
        "email": "aleksey.balakin@x5.ru",
        "mergeCommits": 0,
        "commits": 59,
        "added": 7461,
        "deleted": 1356,
        "testAdded": 2590
    },
    {
        "email": "maksim.zhagolko1@x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 10,
        "deleted": 4,
        "testAdded": 0
    },
    {
        "email": "makszhukov_placeholder_gsiatr3@noreply.scm.x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 9,
        "deleted": 6,
        "testAdded": 0
    },
    {
        "email": "alexander.zharikov@x5.ru",
        "mergeCommits": 139,
        "commits": 92,
        "added": 5129,
        "deleted": 1163,
        "testAdded": 19
    },
    {
        "email": "kiril.aksyutik@x5.ru",
        "mergeCommits": 163,
        "commits": 46,
        "added": 3881,
        "deleted": 446,
        "testAdded": 2774
    },
    {
        "email": "iri.imametdinova@x5.ru",
        "mergeCommits": 0,
        "commits": 39,
        "added": 3518,
        "deleted": 364,
        "testAdded": 3355
    },
    {
        "email": "a.sadriev@x5.ru",
        "mergeCommits": 52,
        "commits": 9,
        "added": 66,
        "deleted": 66,
        "testAdded": 0
    },
    {
        "email": "stepan.ermakov@x5.ru",
        "mergeCommits": 0,
        "commits": 14,
        "added": 1697,
        "deleted": 183,
        "testAdded": 982
    },
    {
        "email": "ilygalochkin_placeholder_bxr06i3@noreply.scm.x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 1,
        "deleted": 1,
        "testAdded": 0
    },
    {
        "email": "viktor.atamanskiy@x5.ru",
        "mergeCommits": 0,
        "commits": 8,
        "added": 68,
        "deleted": 56,
        "testAdded": 0
    },
    {
        "email": "anzh.feoktistova@x5.ru",
        "mergeCommits": 0,
        "commits": 32,
        "added": 2556,
        "deleted": 366,
        "testAdded": 1654
    },
    {
        "email": "pavel.komar@x5.ru",
        "mergeCommits": 0,
        "commits": 19,
        "added": 651,
        "deleted": 104,
        "testAdded": 1
    },
    {
        "email": "alekse.bysha@x5.ru",
        "mergeCommits": 2,
        "commits": 64,
        "added": 5066,
        "deleted": 263,
        "testAdded": 2526
    },
    {
        "email": "boris.osechinskiy@x5.ru",
        "mergeCommits": 0,
        "commits": 135,
        "added": 18790,
        "deleted": 4381,
        "testAdded": 6717
    },
    {
        "email": "vasil.gavrilov@x5.ru",
        "mergeCommits": 0,
        "commits": 28,
        "added": 758,
        "deleted": 294,
        "testAdded": 2
    },
    {
        "email": "georgy.manokhin@x5.ru",
        "mergeCommits": 0,
        "commits": 2,
        "added": 5,
        "deleted": 3,
        "testAdded": 0
    },
    {
        "email": "ilnur.nasibullin@x5.ru",
        "mergeCommits": 35,
        "commits": 67,
        "added": 5838,
        "deleted": 32097,
        "testAdded": 368
    },
    {
        "email": "edua.ivanov@x5.ru",
        "mergeCommits": 6,
        "commits": 75,
        "added": 8421,
        "deleted": 1403,
        "testAdded": 7291
    },
    {
        "email": "and.fomin@x5.ru",
        "mergeCommits": 0,
        "commits": 3,
        "added": 3,
        "deleted": 3,
        "testAdded": 0
    },
    {
        "email": "d.shmelev@x5.ru",
        "mergeCommits": 1,
        "commits": 37,
        "added": 10752,
        "deleted": 15084,
        "testAdded": 106
    },
    {
        "email": "vadim.dvoryankin@x5.ru",
        "mergeCommits": 0,
        "commits": 40,
        "added": 3478,
        "deleted": 1183,
        "testAdded": 2943
    },
    {
        "email": "maksim.tormozov@x5.ru",
        "mergeCommits": 0,
        "commits": 167,
        "added": 6048,
        "deleted": 169120,
        "testAdded": 1658
    },
    {
        "email": "taras.kramarenko@x5.ru",
        "mergeCommits": 0,
        "commits": 11,
        "added": 507,
        "deleted": 127,
        "testAdded": 0
    },
    {
        "email": "mikhail.maryshev@x5.ru",
        "mergeCommits": 0,
        "commits": 46,
        "added": 5060,
        "deleted": 1085,
        "testAdded": 4073
    },
    {
        "email": "p.maslov@x5.ru",
        "mergeCommits": 0,
        "commits": 25,
        "added": 2388,
        "deleted": 780,
        "testAdded": 0
    },
    {
        "email": "alexey.saynukov@x5.ru",
        "mergeCommits": 89,
        "commits": 81,
        "added": 111416,
        "deleted": 12740,
        "testAdded": 7273
    },
    {
        "email": "igor.belyavsky@x5.ru",
        "mergeCommits": 12,
        "commits": 46,
        "added": 12111,
        "deleted": 107477,
        "testAdded": 3006
    },
    {
        "email": "aleksand.dorofeev@x5.ru",
        "mergeCommits": 0,
        "commits": 61,
        "added": 5223,
        "deleted": 448,
        "testAdded": 3160
    },
    {
        "email": "d.gusev@x5.ru",
        "mergeCommits": 89,
        "commits": 4,
        "added": 782,
        "deleted": 167,
        "testAdded": 356
    },
    {
        "email": "vitaly.krasnov@x5.ru",
        "mergeCommits": 0,
        "commits": 20,
        "added": 2895,
        "deleted": 2097,
        "testAdded": 0
    },
    {
        "email": "nikitasemenov@x5.ru",
        "mergeCommits": 5,
        "commits": 12,
        "added": 450,
        "deleted": 196,
        "testAdded": 52
    },
    {
        "email": "ek.tokareva@x5.ru",
        "mergeCommits": 7,
        "commits": 24,
        "added": 946,
        "deleted": 819,
        "testAdded": 0
    },
    {
        "email": "maksim.zhagolko@x5.ru",
        "mergeCommits": 0,
        "commits": 5,
        "added": 10,
        "deleted": 4,
        "testAdded": 0
    },
    {
        "email": "g.zaytsev@x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 2,
        "deleted": 1,
        "testAdded": 0
    },
    {
        "email": "evgeny.botylev@x5.ru",
        "mergeCommits": 2,
        "commits": 28,
        "added": 664,
        "deleted": 156,
        "testAdded": 0
    },
    {
        "email": "pavel.trusov@x5.ru",
        "mergeCommits": 1,
        "commits": 50,
        "added": 9083,
        "deleted": 4264,
        "testAdded": 0
    },
    {
        "email": "a.korolev@x5.ru",
        "mergeCommits": 14,
        "commits": 6,
        "added": 2655,
        "deleted": 63,
        "testAdded": 0
    },
    {
        "email": "konstan.talalaev@x5.ru",
        "mergeCommits": 0,
        "commits": 54,
        "added": 2323,
        "deleted": 571,
        "testAdded": 0
    },
    {
        "email": "anton.lezhnin@x5.ru",
        "mergeCommits": 37,
        "commits": 42,
        "added": 9591,
        "deleted": 1916,
        "testAdded": 3238
    },
    {
        "email": "nikit.tomashov@x5.ru",
        "mergeCommits": 0,
        "commits": 16,
        "added": 2050,
        "deleted": 457,
        "testAdded": 1376
    },
    {
        "email": "m.kim@x5.ru",
        "mergeCommits": 0,
        "commits": 25,
        "added": 1476,
        "deleted": 182,
        "testAdded": 32
    },
    {
        "email": "dragomir.onich@x5.ru",
        "mergeCommits": 0,
        "commits": 44,
        "added": 2589,
        "deleted": 897,
        "testAdded": 627
    },
    {
        "email": "tatiana.matvienko@x5.ru",
        "mergeCommits": 24,
        "commits": 110,
        "added": 30578,
        "deleted": 1836,
        "testAdded": 14359
    },
    {
        "email": "dmitry.dyukov@x5.ru",
        "mergeCommits": 23,
        "commits": 82,
        "added": 10130,
        "deleted": 1392,
        "testAdded": 4055
    },
    {
        "email": "pavel.pugach@x5.ru",
        "mergeCommits": 0,
        "commits": 48,
        "added": 10086,
        "deleted": 2734,
        "testAdded": 45
    },
    {
        "email": "daniil.volfengaut@x5.ru",
        "mergeCommits": 0,
        "commits": 17,
        "added": 464,
        "deleted": 215,
        "testAdded": 0
    },
    {
        "email": "dias.arkharov@x5.ru",
        "mergeCommits": 0,
        "commits": 6,
        "added": 90,
        "deleted": 3,
        "testAdded": 0
    },
    {
        "email": "ivmatveev@x5.ru",
        "mergeCommits": 5,
        "commits": 105,
        "added": 34667,
        "deleted": 8253,
        "testAdded": 6352
    },
    {
        "email": "ilya.vatsevich@x5.ru",
        "mergeCommits": 0,
        "commits": 64,
        "added": 8582,
        "deleted": 2807,
        "testAdded": 2141
    },
    {
        "email": "mikhailmaryshev_placeholder_10pbwd2@noreply.scm.x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 21,
        "deleted": 280,
        "testAdded": 0
    },
    {
        "email": "se.cherkasov@x5.ru",
        "mergeCommits": 7,
        "commits": 0,
        "added": 0,
        "deleted": 0,
        "testAdded": 0
    },
    {
        "email": "maksim.tseynar@x5.ru",
        "mergeCommits": 0,
        "commits": 28,
        "added": 5429,
        "deleted": 1544,
        "testAdded": 1317
    },
    {
        "email": "evgeny.kuzhabaev@x5.ru",
        "mergeCommits": 74,
        "commits": 84,
        "added": 1884,
        "deleted": 1224,
        "testAdded": 41
    },
    {
        "email": "artepopov@x5.ru",
        "mergeCommits": 28,
        "commits": 65,
        "added": 7028,
        "deleted": 1457,
        "testAdded": 4404
    },
    {
        "email": "ni.sviridov@x5.ru",
        "mergeCommits": 11,
        "commits": 39,
        "added": 10753,
        "deleted": 5023,
        "testAdded": 15
    },
    {
        "email": "s.sova@x5.ru",
        "mergeCommits": 55,
        "commits": 25,
        "added": 1240,
        "deleted": 1417,
        "testAdded": 10
    },
    {
        "email": "alekse.kirilin@x5.ru",
        "mergeCommits": 1,
        "commits": 19,
        "added": 3893,
        "deleted": 1480,
        "testAdded": 0
    },
    {
        "email": "arseniy.chevtaykin@x5.ru",
        "mergeCommits": 74,
        "commits": 1,
        "added": 1,
        "deleted": 1,
        "testAdded": 0
    },
    {
        "email": "an.kiselev@x5.ru",
        "mergeCommits": 0,
        "commits": 23,
        "added": 6629,
        "deleted": 2145,
        "testAdded": 611
    },
    {
        "email": "aleksanddorofeev_placeholder_wpnovg3@noreply.scm.x5.ru",
        "mergeCommits": 0,
        "commits": 1,
        "added": 112,
        "deleted": 1,
        "testAdded": 73
    }
];

const Example = () => {
    //should be memoized or stable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'email', //access nested data with dot notation
                header: 'Email',
                size: 150,
            },
            {
                accessorKey: 'mergeCommits',
                header: 'Merge',
                size: 30,
            },
            {
                accessorKey: 'commits', //normal accessorKey
                header: 'Commits',
                size: 30,
            },
            {
                accessorKey: 'added',
                header: 'Added',
                size: 30,
            },
            {
                accessorKey: 'deleted',
                header: 'Deleted',
                size: 30,
            },
            {
                accessorKey: 'testAdded',
                header: 'Added Tests',
                size: 30,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data,
        muiTableHeadCellProps: {
            sx: {
                fontFamily: 'Manrope',
            },
        },
        muiTableBodyCellProps: ({ column }) => ({
            sx: {
                fontFamily: 'Manrope',
            },
        }),
        initialState: {
            pagination: { pageIndex: 0, pageSize: 30 }, //set different default page size
        },
    });

    return <MaterialReactTable table={table}  />;
};

export default Example;
