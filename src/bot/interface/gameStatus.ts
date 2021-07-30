export interface Pig {
    "Id": number,
    "Pig_id": number,
    "Pig_size": number,
    "Pig_sex": number,
    "Pig_germ": number,
    "Pig_mating": number,
    "Pig_notdead": number,
    "Pig_toxin": number,
    "Pig_pregnant": number,
    "Pig_power": number,
    "Pig_gene": number,
    "Pig_medic": number,
    "Pig_weight": number,
    "Pig_food": boolean,
    "Pig_water": boolean,
    "Pig_tobreed": boolean,
    "Pig_dead": boolean,
    "Pig_cansteal": boolean,
    "Pig_curLefttime": string
}

export interface ItemDrop {
    "Id": number,
    "Itemid": number,
    "Amount": number,
    "Itemtype": number,
    "Coin": number,
}

export interface GameStatus {
    "fly": boolean,
    "itemdrops_list": ItemDrop[],
    "pigcount": number,
    "pigs_list": Pig[]
}