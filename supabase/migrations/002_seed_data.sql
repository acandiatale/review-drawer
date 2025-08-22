-- Insert initial teams
INSERT INTO teams (name, description) VALUES
    ('개발팀', 'Product Development Team - 제품 개발을 담당하는 팀'),
    ('운영팀', 'Operations Team - 서비스 운영을 담당하는 팀')
ON CONFLICT (name) DO NOTHING;

-- Get team IDs for reference
DO $$
DECLARE
    dev_team_id UUID;
    ops_team_id UUID;
BEGIN
    -- Get team IDs
    SELECT id INTO dev_team_id FROM teams WHERE name = '개발팀';
    SELECT id INTO ops_team_id FROM teams WHERE name = '운영팀';

    -- Insert development team members
    INSERT INTO team_members (team_id, name, email, avatar_url) VALUES
        (dev_team_id, '김개발', 'kim.dev@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim'),
        (dev_team_id, '이프론트', 'lee.front@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee'),
        (dev_team_id, '박백엔드', 'park.back@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=park'),
        (dev_team_id, '최풀스택', 'choi.full@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=choi'),
        (dev_team_id, '정데브옵스', 'jung.devops@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jung'),
        (dev_team_id, '강모바일', 'kang.mobile@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kang'),
        (dev_team_id, '조AI', 'jo.ai@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jo'),
        (dev_team_id, '윤데이터', 'yoon.data@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoon')
    ON CONFLICT (team_id, email) DO NOTHING;

    -- Insert operations team members
    INSERT INTO team_members (team_id, name, email, avatar_url) VALUES
        (ops_team_id, '김운영', 'kim.ops@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimops'),
        (ops_team_id, '이마케팅', 'lee.marketing@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=leemarketing'),
        (ops_team_id, '박기획', 'park.planning@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=parkplanning'),
        (ops_team_id, '최디자인', 'choi.design@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=choidesign'),
        (ops_team_id, '정콘텐츠', 'jung.content@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jungcontent'),
        (ops_team_id, '강고객지원', 'kang.support@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kangsupport'),
        (ops_team_id, '조분석', 'jo.analytics@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=joanalytics'),
        (ops_team_id, '윤파트너십', 'yoon.partner@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoonpartner')
    ON CONFLICT (team_id, email) DO NOTHING;

    -- Insert sample roulette execution (optional - for testing)
    INSERT INTO roulettes (team_id, selected_members, total_participants, executed_by)
    SELECT 
        dev_team_id,
        '[{"id": "sample1", "name": "김개발", "email": "kim.dev@company.com", "position": "top"},
          {"id": "sample2", "name": "박백엔드", "email": "park.back@company.com", "position": "bottom"}]'::jsonb,
        8,
        'admin@company.com'
    WHERE EXISTS (SELECT 1 FROM teams WHERE id = dev_team_id);

END $$;

-- Create a function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(10) := '';
    i INTEGER;
    random_index INTEGER;
BEGIN
    -- Generate a 6-character code
    FOR i IN 1..6 LOOP
        random_index := floor(random() * length(chars) + 1);
        result := result || substr(chars, random_index, 1);
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a sample invite for testing (expires in 24 hours)
INSERT INTO invites (roulette_id, code, expires_at)
SELECT 
    id,
    generate_invite_code(),
    NOW() + INTERVAL '24 hours'
FROM roulettes
LIMIT 1;