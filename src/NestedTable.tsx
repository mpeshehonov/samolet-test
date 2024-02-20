// NestedTable.tsx
import React, {useMemo, useState} from 'react';
import {CellContext, ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table';
import Select, {SingleValue} from 'react-select';
import {allOptions} from './data';

interface Option {
    value: string;
    label: string;
}


interface DataItem {
    [key: string]: any;
}

const convertOptions = (parentId: string | null): Option[] =>
    allOptions
        .filter(option => option.parentId === parentId)
        .map(option => ({value: option.id, label: option.id}));

const NestedTable = () => {
    const [data, setData] = useState<DataItem[]>([]);
    const [rowsCount, setRowsCount] = useState<string>('');

    const columns = useMemo<ColumnDef<DataItem>[]>(() => [
        {
            accessorFn: (row, i) => i + 1,
            id: 'index',
            cell: info => info.getValue(),
            header: () => <span>#</span>,
        },
        ...Array.from({length: 5}, (_, index) => ({
            id: `level_${index + 1}`,
            accessorKey: `level_${index + 1}`,
            cell: (info: CellContext<DataItem, any>) => {
                const level = info.column.id as string;
                const match = level.match(/\d+$/);
                // Проверяем, что match не равен null перед обращением к [0]
                const levelNumber = match ? Number(match[0]) : 0; // Используем 0 или другое безопасное значение по умолчанию
                const parentId = levelNumber === 1 ? null : info.row.original[`level_${levelNumber - 1}`];
                const options: Option[] = convertOptions(parentId);

                return (
                    <Select
                        placeholder="Выберите"
                        options={options}
                        onChange={(selectedOption: SingleValue<Option>) => {
                            const updatedData = data.map((row, rowIndex) => {
                                if (rowIndex === info.row.index) {
                                    const newRow = {...row, [level]: selectedOption?.value};
                                    // Сбросить все следующие уровни
                                    for (let i = levelNumber + 1; i <= 5; i++) {
                                        newRow[`level_${i}`] = undefined;
                                    }
                                    return newRow;
                                }
                                return row;
                            });
                            setData(updatedData);
                        }}
                        value={options.find(option => option.value === info.getValue())}
                    />
                );
            },
            header: () => <span>Уровень {index + 1}</span>,
        })),
    ], [data]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });


    const addRows = () => {
        const newRows = Array.from({length: Number(rowsCount)}, () => ({
            level_1: undefined,
            level_2: undefined,
            level_3: undefined,
            level_4: undefined,
            level_5: undefined,
        }));
        setData([...data, ...newRows]);
        setRowsCount('');
    };

    const saveData = () => {
        console.log(data);
    };

    return (
        <div className="w-full h-full">
            <table className="w-full border border-black">
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className="px-2 py-1 border border-black">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="border border-black">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="mt-3 p-2 flex gap-2">
                <div className="flex gap-2 items-center p-2 border border-black">
                     <span className="font-extrabold text-black text-2xl">
                        +
                    </span>
                    <button onClick={addRows}>Добавить строки</button>
                </div>

                <input
                    className="p-2 border border-black"
                    type="number"
                    value={rowsCount}
                    onChange={e => setRowsCount(e.target.value)}
                    placeholder="Количество строк"
                />
            </div>

            <div className="flex p-2">
                <button
                    className="bg-black px-3 py-1 text-white rounded-lg"
                    onClick={saveData}>Сохранить
                </button>
            </div>

        </div>
    );
};

export default NestedTable;
