program prediction_market.aleo;

record Market:
    owner as address.private;
    question as field.private;
    total_yes as u64.private;
    total_no as u64.private;
    resolved as boolean.private;

function create_market:
    input r0 as field.private;
    cast self.caller r0 0u64 0u64 false into r1 as Market.record;
    output r1 as Market.record;

function place_bet:
    input r0 as Market.record;
    input r1 as u64.private;
    input r2 as boolean.private;
    not r0.resolved into r3;
    assert.eq r3 true;
    gt r1 0u64 into r4;
    assert.eq r4 true;
    add r0.total_yes r1 into r5;
    add r0.total_no r1 into r6;
    ternary r2 r5 r0.total_yes into r7;
    ternary r2 r0.total_no r6 into r8;
    cast r0.owner r0.question r7 r8 false into r9 as Market.record;
    output r9 as Market.record;

function resolve_market:
    input r0 as Market.record;
    not r0.resolved into r1;
    assert.eq r1 true;
    cast r0.owner r0.question r0.total_yes r0.total_no true into r2 as Market.record;
    output r2 as Market.record;
