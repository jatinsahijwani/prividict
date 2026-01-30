program prediction_market.aleo {

    record Market {
        owner: address,
        question: field,
        total_yes: u64,
        total_no: u64,
        resolved: bool,
    }

    transition create_market(question: field) -> Market {
        let market = Market {
            owner: self.caller,
            question: question,
            total_yes: 0u64,
            total_no: 0u64,
            resolved: false,
        };

        return market;
    }

    transition place_bet(
        market: Market,
        bet_amount: u64,
        is_yes: bool,
    ) -> Market {

        assert(!market.resolved);
        assert(bet_amount > 0u64);

        let yes = market.total_yes;
        let no = market.total_no;

        if is_yes {
            yes = yes + bet_amount;
        } else {
            no = no + bet_amount;
        }

        let updated_market = Market {
            owner: market.owner,
            question: market.question,
            total_yes: yes,
            total_no: no,
            resolved: false,
        };

        return updated_market;
    }

    transition resolve_market(market: Market) -> Market {
        assert(!market.resolved);

        let resolved_market = Market {
            owner: market.owner,
            question: market.question,
            total_yes: market.total_yes,
            total_no: market.total_no,
            resolved: true,
        };

        return resolved_market;
    }
}